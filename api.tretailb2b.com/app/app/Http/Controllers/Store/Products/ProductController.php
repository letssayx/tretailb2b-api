<?php

namespace App\Http\Controllers\Store\Products;

use App\User;
use App\Store\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;
use \Firebase\JWT\JWT;
use App\Http\Middleware\TretailAuth;
use App\Helper\ApiAuth;
use App;
use App\Store\Item;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManagerStatic as Image;
use Google\Cloud\Storage\StorageClient;

class ProductController extends Controller
{
    
    /**
     * Get  Products.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ProductList(Request $request)
    {
        
        try {
        //$api_auth = App::make(ApiAuth::class);
        $products=null;
        $products_output=[];
        $query = $request->all();
        if(isset($query['filter'])){
            $filter=json_decode($query['filter'],true);
        }
        if(isset($query['range'])){
            $range=json_decode($query['range'],true);
        }
        if(isset($query['sort'])){
            $sort=json_decode($query['sort'],true);
        }
        // Count after filter(if any) apply 
        $total_products_count=0;
        if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
            if(isset($filter['q']) && !empty($filter['q'])) {
                $products= Product::where('name', 'like', '%'.$filter['q'].'%')->orWhere('sku', 'like', '%'.$filter['q'].'%')->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                $total_products_count= Product::select(DB::raw('count(*) as total_count'))->where('name', 'not like', '%'.'undefined'.'%')->where('name', 'like', '%'.$filter['q'].'%')->orWhere('sku', 'like', '%'.$filter['q'].'%')->first();
            }
            else {
                $products= Product::orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->where('name', 'not like', '%'.'undefined'.'%')->get();
                $total_products_count= Product::select(DB::raw('count(*) as total_count'))->where('name', 'not like', '%'.'undefined'.'%')->first();
            } 
            
           
        }
        else {
            $products= Product::where('name', 'not like', '%'.'undefined'.'%')->get();
            $total_products_count= Product::select(DB::raw('count(*) as total_count'))->where('name', 'not like', '%'.'undefined'.'%')->first(); 
        }

        foreach ($products as $product) {
            $thumbnail_image=null;
            $pic_arr=json_decode($product->pictures,true);
            if(isset($pic_arr['images']) && count($pic_arr['images'])) {
                $thumbnail_image ='https://storage.googleapis.com/'.$pic_arr['bucket'].'/'.$pic_arr['client'].'/'.$pic_arr['folder'].'/'.$pic_arr['images'][0]['thumbnail_image_name'];
            }
            else {
                $thumbnail_image ='https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png';
            }
            array_push($products_output,array(
                'status' => "success",
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'hsn_code' => $product->hsn_code,
                'thumbnail_image' => $thumbnail_image
            ));
        }
        return response()->json($products_output)->header('X-Total-Count', isset($total_products_count->total_count) ? $total_products_count->total_count : 0);
        
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }


    /**
     * Create Product.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ProductCreate(Request $request)
    {
        $api_auth = App::make(ApiAuth::class);
        $folder_name=Str::random(15);
         // Authenticating with a keyfile path for google storage 
         $storage = new StorageClient([
            'keyFilePath' => env('GCP_STORAGE_KEY_FILE_PATH')
        ]);
        $bucket = $storage->bucket(env('GCP_PRODUCTS_BUCKET'));
        DB::beginTransaction();
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name' => 'required|max:255',
            'sku' => 'required|regex:/^\S+\w/|unique:products|max:255',
            'brand_id' => 'required',
            'manufacturer_id' => 'required',
            'country_id' => 'required',
            'category_id' => 'required',
            'subcategory_id' => 'required',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'Validation Error');
            return response()->json($error_obj, 405);
        }
        // add data 
        $product= new Product;
        $product->name= $input_array['name'];
        $product->sku= $input_array['sku'];
        $product->description= $input_array['description'];
        $product->brand_id= $input_array['brand_id'];
        $product->manufacturer_id= $input_array['manufacturer_id'];
        $product->country_id= $input_array['country_id'];
        $product->category_id=$input_array['subcategory_id'];
        $product->launch_date=isset($input_array['launch_date']) ? $input_array['launch_date'] : false;
        $product->hsn_code=isset($input_array['hsn_code']) ? $input_array['hsn_code'] : '';
        $product->tax_rate=isset($input_array['tax_rate']) ? $input_array['tax_rate'] : 0;
        $product->asin=isset($input_array['asin']) ? $input_array['asin'] : false;
        $product->active=isset($input_array['active']) ? $input_array['active'] : false;
        

        $pictures=[];
        
        // upload & process images 
        if(isset($input_array['pictures'])) {
            Storage::disk('local')->makeDirectory($folder_name);
            $pictures['bucket']=env('GCP_PRODUCTS_BUCKET');
            $pictures['client']=$api_auth->user()->client_details['name'];
            $pictures['folder']=$folder_name;
            $pictures['images']=[];
            foreach($input_array['pictures'] as $image_64) {
                $extension = explode('/', explode(':', substr($image_64['src'], 0, strpos($image_64['src'], ';')))[1])[1];   // .jpg .png .pdf
                $replace = substr($image_64['src'], 0, strpos($image_64['src'], ',')+1); 
                // find substring fro replace here eg: data:image/png;base64,
                $image = str_replace($replace, '', $image_64['src']); 
                $image = str_replace(' ', '+', $image); 
                $file_name=Str::random(10);
                $imageName = $file_name.'.'.$extension;
                $imageName_thumbnail= $file_name.'-thumbnail'.'.'.$extension;
                $imageName_general= $file_name.'-general'.'.'.$extension;
                Storage::disk('local')->put($folder_name.'/'.$imageName, base64_decode($image));
                $path = Storage::path($folder_name.'/'.$imageName);
                $image_resize = Image::make($path);  
                $image_resize->resize(210, 280); // 3:4 for General  
                $image_resize->save(storage_path().'//app/'.$folder_name.'/'.$imageName_general);         
                $image_resize->resize(75, 100); // 3:4 for thumbnail 
                $image_resize->save(storage_path().'//app/'.$folder_name.'/'.$imageName_thumbnail);
                //upload to gcp storage
                $file_read = fopen($path, 'r');
                $object = $bucket->upload($file_read, [
                    'predefinedAcl' => 'publicRead',
                    'name' => $api_auth->user()->client_details['name'].'/'.$folder_name.'/'.$imageName
                ]);
                $file_read = fopen(storage_path().'//app/'.$folder_name.'/'.$imageName_general, 'r');
                $object = $bucket->upload($file_read, [
                    'predefinedAcl' => 'publicRead',
                    'name' => $api_auth->user()->client_details['name'].'/'.$folder_name.'/'.$imageName_general
                ]);
                $file_read = fopen(storage_path().'//app/'.$folder_name.'/'.$imageName_thumbnail, 'r');
                $object = $bucket->upload($file_read, [
                    'predefinedAcl' => 'publicRead',
                    'name' => $api_auth->user()->client_details['name'].'/'.$folder_name.'/'.$imageName_thumbnail
                ]);
                array_push($pictures['images'],array(
                    'actual_image_name' => $imageName,
                    'general_image_name' => $imageName_general,
                    'thumbnail_image_name' => $imageName_thumbnail,
                ));
            }
             // delete local folder created for images 
            Storage::deleteDirectory($folder_name);

        }

        $product->pictures= isset($input_array['pictures']) ? json_encode($pictures) : null;
        $product->save();
         // Commit Transaction
         DB::commit();
        return response()->json(["status" => "success","message" => "Successfully Product Created","id" => $product->id],201);
        }
    catch(\Exception $e) {
        // delete folder if created for images 
        Storage::deleteDirectory($folder_name);
        // delete GCP storage if any error 
        $object = $bucket->object($api_auth->user()->client_details['name'].'/'.$folder_name.'/'); // seems not working
        if ($object->exists()) {
            $object->delete();
        }
       
         // Rollback Transaction
         DB::rollback();
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Show Product.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ProductShow($id)
    {

        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $product=Product::find($id);
        $pictures=[];
        $pic_arr=json_decode($product->pictures,true);
        if(isset($pic_arr['images'])) {
            foreach($pic_arr['images'] as $image) {
                array_push($pictures,array(
                    'src' => 'https://storage.googleapis.com/'.$pic_arr['bucket'].'/'.$pic_arr['client'].'/'.$pic_arr['folder'].'/'.$image['general_image_name'],
                    'title' => $image['actual_image_name']
                )); 
             }
        }
        
        $output=array(
            'status'=>'success',
            'message'=>'Successfully get product',
            'id'=> $product->id,
            'name'=> $product->name,
            'description'=> $product->description,
            'sku'=> $product->sku,
            'asin'=> $product->asin,
            'brand_id'=> $product->brand_id,
            'manufacturer_id'=> $product->manufacturer_id,
            'country_id'=> $product->country_id,
            'subcategory_id'=> $product->category_id,
            'category_id'=> $product->category->parent_category_id,
            'launch_date'=> $product->launch_date,
            'hsn_code'=> $product->hsn_code,
            'tax_rate'=> $product->tax_rate,
            'active'=> $product->active,
            'pictures' => $pictures
        );
        return response()->json($output);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Create User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ProductEdit(Request $request,$id)
    {
        $api_auth = App::make(ApiAuth::class);
        $folder_name=Str::random(15);
         // Authenticating with a keyfile path for google storage 
         $storage = new StorageClient([
            'keyFilePath' => env('GCP_STORAGE_KEY_FILE_PATH')
        ]);
        $bucket = $storage->bucket(env('GCP_PRODUCTS_BUCKET'));
        DB::beginTransaction();
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name' => 'required|max:255',
            'brand_id' => 'required',
            'manufacturer_id' => 'required',
            'country_id' => 'required',
            'category_id' => 'required',
            'subcategory_id' => 'required',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }
        // add data 
        $product= Product::find($id);
        $product->name= $input_array['name'];
        $product->description= $input_array['description'];
        $product->brand_id= $input_array['brand_id'];
        $product->manufacturer_id= $input_array['manufacturer_id'];
        $product->country_id= $input_array['country_id'];
        $product->category_id=$input_array['subcategory_id'];
        $product->launch_date=isset($input_array['launch_date']) ? $input_array['launch_date'] : false;
        $product->hsn_code=isset($input_array['hsn_code']) ? $input_array['hsn_code'] : '';
        $product->tax_rate=isset($input_array['tax_rate']) ? $input_array['tax_rate'] : 0;
        $product->active=isset($input_array['active']) ? $input_array['active'] : false;
        $product->asin=isset($input_array['asin']) ? $input_array['asin'] : false;
        $pictures=[];
        $old_images=json_decode($product->pictures,true);
        //$pictures=$old_images;
        $deletable_image=[];
        // upload & process images 

            if($old_images && isset($old_images['folder']) && !empty($old_images['folder'])) {
                $folder_name = $old_images['folder'];
                $pictures['bucket']=$old_images['bucket'];
                $pictures['client']=$old_images['client'];
                $pictures['folder']=$old_images['folder'];
                $pictures['images']=[];
            }
            else
            {
                $pictures['bucket']=env('GCP_PRODUCTS_BUCKET');
                $pictures['client']=$api_auth->user()->client_details['name'];
                $pictures['folder']=$folder_name;
                $pictures['images']=[];
            }
            // check old image available or not , if not available need to delete 
            if($old_images && isset($old_images['images']) && !empty($old_images['images'])) {
            foreach($old_images['images'] as $existing_image) {
                $deletable=true;
                foreach ($input_array['pictures_old'] as $img) {
                    if($img['title']==$existing_image['actual_image_name']) {
                        $deletable=false;
                        array_push($pictures['images'],array(
                            'actual_image_name' => $existing_image['actual_image_name'],
                            'general_image_name' =>$existing_image['general_image_name'],
                            'thumbnail_image_name' => $existing_image['thumbnail_image_name'],
                        ));
                    break;
                    }
                }
                if($deletable) {
                    array_push($deletable_image,$existing_image['actual_image_name']);
                    array_push($deletable_image,$existing_image['general_image_name']);
                    array_push($deletable_image,$existing_image['thumbnail_image_name']);
                }
            }
        }
            Storage::disk('local')->makeDirectory($folder_name);
           
            foreach($input_array['pictures'] as $image_64) {
                $extension = explode('/', explode(':', substr($image_64['src'], 0, strpos($image_64['src'], ';')))[1])[1];   // .jpg .png .pdf
                $replace = substr($image_64['src'], 0, strpos($image_64['src'], ',')+1); 
                // find substring fro replace here eg: data:image/png;base64,
                $image = str_replace($replace, '', $image_64['src']); 
                $image = str_replace(' ', '+', $image); 
                $file_name=Str::random(10);
                $imageName = $file_name.'.'.$extension;
                $imageName_thumbnail= $file_name.'-thumbnail'.'.'.$extension;
                $imageName_general= $file_name.'-general'.'.'.$extension;
                Storage::disk('local')->put($folder_name.'/'.$imageName, base64_decode($image));
                $path = Storage::path($folder_name.'/'.$imageName);
                $image_resize = Image::make($path);  
                $image_resize->resize(210, 280); // 3:4 for General  
                $image_resize->save(storage_path().'//app/'.$folder_name.'/'.$imageName_general);         
                $image_resize->resize(75, 100); // 3:4 for thumbnail 
                $image_resize->save(storage_path().'//app/'.$folder_name.'/'.$imageName_thumbnail);
                //upload to gcp storage
                $file_read = fopen($path, 'r');
                $object = $bucket->upload($file_read, [
                    'predefinedAcl' => 'publicRead',
                    'name' => $api_auth->user()->client_details['name'].'/'.$folder_name.'/'.$imageName
                ]);
                $file_read = fopen(storage_path().'//app/'.$folder_name.'/'.$imageName_general, 'r');
                $object = $bucket->upload($file_read, [
                    'predefinedAcl' => 'publicRead',
                    'name' => $api_auth->user()->client_details['name'].'/'.$folder_name.'/'.$imageName_general
                ]);
                $file_read = fopen(storage_path().'//app/'.$folder_name.'/'.$imageName_thumbnail, 'r');
                $object = $bucket->upload($file_read, [
                    'predefinedAcl' => 'publicRead',
                    'name' => $api_auth->user()->client_details['name'].'/'.$folder_name.'/'.$imageName_thumbnail
                ]);
                array_push($pictures['images'],array(
                    'actual_image_name' => $imageName,
                    'general_image_name' => $imageName_general,
                    'thumbnail_image_name' => $imageName_thumbnail,
                ));
            }
            

             // delete local folder created for images 
            Storage::deleteDirectory($folder_name);


        $product->pictures= !empty($pictures) ? json_encode($pictures) : null;

        $product->save();

        // remove images from 
        foreach($deletable_image as $img) {
            $object = $bucket->object($api_auth->user()->client_details['name'].'/'.$folder_name.'/'.$img); 
            if ($object->exists()) {
                $object->delete();
            }
        }
         // Commit Transaction
         DB::commit();
        return response()->json(['status' => "success","message" => "Successfully Product Updated"],200);
        }
    catch(\Exception $e) {
         // Rollback Transaction
         DB::rollback();
         // need to delete images that added newly 
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Delete Product.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ProductDelete($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        // check products using anywhere in the system, if available in Order table. It not allow to delete. If not 
        // Delete child SKU 
        $product = Product::find($id);
        if($product) {
            //Delete child SKU's before deleting products 
            $deletedChildSKU = Item::where('product_id',$product->id)->delete();
            // Delete product images from GCP storage 
        }
        $old_images=json_decode($product->pictures,true);
        $product->delete();
        // remove GCP images for that product 
         // Authenticating with a keyfile path for google storage 
         $storage = new StorageClient([
            'keyFilePath' => env('GCP_STORAGE_KEY_FILE_PATH')
        ]);
        $bucket = $storage->bucket(env('GCP_PRODUCTS_BUCKET'));
        foreach($old_images['images'] as $img) {
            $object = $bucket->object($old_images['client'].'/'.$old_images['folder'].'/'.$img['actual_image_name']); 
            if ($object->exists()) {
                $object->delete();
            }
            $object = $bucket->object($old_images['client'].'/'.$old_images['folder'].'/'.$img['general_image_name']); 
            if ($object->exists()) {
                $object->delete();
            }
            $object = $bucket->object($old_images['client'].'/'.$old_images['folder'].'/'.$img['thumbnail_image_name']); 
            if ($object->exists()) {
                $object->delete();
            }
            $object = $bucket->object($old_images['client'].'/'.$old_images['folder'].'/'); 
            if ($object->exists()) {
                $object->delete();
            }

        }
        return response()->json(["status" => "success","message" => "Successfully Product Deleted"],200);

        }

    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }



  
}
