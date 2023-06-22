<?php

namespace App\Http\Controllers\Store\Products;

use App\User;
use App\Store\Brand;
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
use App\Store\Category;
use App\Store\Item;
use Illuminate\Validation\Rule;


class ItemController extends Controller
{
    
    /**
     * Get  Brands.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ItemListFilter(Request $request)
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
        $query = $request->all();
        $count = 0;
        $items=[];
        if(isset($query['filter'])){
            $filter=json_decode($query['filter'],true);
        }
        if(isset($query['range'])){
            $range=json_decode($query['range'],true);
        }
        if(isset($query['sort'])){
            $sort=json_decode($query['sort'],true);
        }
        $total_items_count=0;
        if(isset($filter['product_id'])) {
            $items=Item::where('product_id',$filter['product_id'])->get();
            $count = $items->count();
        }
        else {
            if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
                $items_list_query=Item::query();
                $total_items_count_query=Item::query();
                if(isset($filter['active']) && !empty($filter['active'])){
                    $items_list_query->where('active',true);
                    //$total_items_count_query->select(DB::raw('count(*) as total_count'))->where('active',$filter['active']);
                }
                if(isset($filter['inventory_type']) && !empty($filter['inventory_type'])){
                    $items_list_query->where('inventory_type',$filter['inventory_type']);
                    //$total_items_count_query->select(DB::raw('count(*) as total_count'))->where('inventory_type',$filter['inventory_type']);
                }
                if(isset($filter['q']) && !empty($filter['q'])) {
                    $items_list_query->where('sku', 'like', '%'.$filter['q'].'%');
                    //$total_items_count_query->select(DB::raw('count(*) as total_count'))->where('sku', 'like', '%'.$filter['q'].'%');
                }
                else {
                    $items_list_query;
                    //$total_items_count_query->select(DB::raw('count(*) as total_count'));
                }
                if(isset($filter['type']) && !empty($filter['type']) && $filter['type']=='new') {
                    $items_list_query->where('newly_added',true);
                    //$total_items_count_query->select(DB::raw('count(*) as total_count'))->where('sku', 'like', '%'.$filter['q'].'%');
                }
                $count = $items_list_query->where('sku', 'not like', '%'.'undefined'.'%')->count(); 
                $items_list=$items_list_query->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->where('sku', 'not like', '%'.'undefined'.'%')->get();
                //$total_items_count=$total_items_count_query->first();
                
               
            }
            else {
                if(isset($filter['id']) && !empty($filter['id'])) {
                    $items_list= Item::whereIn('id', $filter['id'])->where('sku', 'not like', '%'.'undefined'.'%')->get();
                    //$total_items_count= Item::select(DB::raw('count(*) as total_count'))->whereIn('id', $filter['id'])->first();
                }
                else {
                    $items_list=Item::where('sku', 'not like', '%'.'undefined'.'%')->get();
                    //$total_items_count= Item::select(DB::raw('count(*) as total_count'))->first();
                }
                $count = $items_list->count(); 
                
            }
            
            foreach ($items_list as $item_single) {

                if($item_single->inventory_type==1){
                    $min_quantities=[];
                    foreach($item_single->combo_items as $combo_item){
                        $min_quantities[]=(int)($combo_item->child_item->quantity/$combo_item->quantity);
                    }
                    $bundle_count=count($min_quantities)!=0?min($min_quantities):0;
                    array_push($items,array(
                        'status' => "success",
                        'id' => $item_single->id,
                        'product_id' =>null,
                        'product_name' =>$item_single->name,
                        'product_name_with_sku' => $item_single->sku,
                        'product_sku' =>'',
                        'product_category_id' =>'',
                        'product_category_name' =>'',
                        'product_subcategory_id' =>'',
                        'product_subcategory_name' => '',
                        'product_brand_id' =>'',
                        'product_brand_name' =>'',
                        'sku' => $item_single->sku,
                        'mrp' => $item_single->mrp,
                        'price' => $item_single->price,
                        'inventory_location' =>'',
                        'length' => null,
                        'breadth' =>null,
                        'height' => null,
                        'dimension_unit' => $item_single->dimension_unit,
                        'weight_unit' => $item_single->weight_unit,
                        'weight' => $item_single->weight,
                        'quantity' => $bundle_count,
                        'variants' => json_decode($item_single->variants,true),
                        'active' => $item_single->active,
                        'inventory_type'=>'Combo',
                        'thumbnail_image' => 'https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png',
                    ));
                    continue;
                }
                $thumbnail_image=null;
                $pic_arr=json_decode($item_single->product->pictures,true);
                if(isset($pic_arr['images']) && count($pic_arr['images'])) {
                    $thumbnail_image ='https://storage.googleapis.com/'.$pic_arr['bucket'].'/'.$pic_arr['client'].'/'.$pic_arr['folder'].'/'.$pic_arr['images'][0]['thumbnail_image_name'];
                }
                else {
                    $thumbnail_image ='https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png';
                }
                 // Dimentions breakdown
                 $dimention_array=explode('*',$item_single->dimentions);
                if(!count($dimention_array)) {
                    $dimention_array=explode('X',$item_single->dimentions);
                }

                $length=0;
                $breadth=0;
                $height=0;
                if(count($dimention_array)==3) {
                    $length= $dimention_array[0];
                    $breadth= $dimention_array[1];
                    $height= $dimention_array[2];
                }
                        
                array_push($items,array(
                    'status' => "success",
                    'id' => $item_single->id,
                    'product_id' => $item_single->product_id,
                    'product_name' => $item_single->product->name,
                    'product_name_with_sku' => $item_single->sku,
                    'product_sku' => $item_single->product->sku,
                    'product_category_id' => $item_single->product->category->parent_category_id,
                    'product_category_name' => Category::find($item_single->product->category->parent_category_id)->name,
                    'product_subcategory_id' => $item_single->product->category->id,
                    'product_subcategory_name' => $item_single->product->category->name,
                    'product_brand_id' => $item_single->product->brand->id,
                    'product_brand_name' => $item_single->product->brand->name,
                    'sku' => $item_single->sku,
                    'mrp' => $item_single->mrp,
                    'price' => $item_single->price,
                    'inventory_location' => $item_single->inventory_location,
                    'length' => $length,
                    'breadth' => $breadth,
                    'height' => $height,
                    'dimension_unit' => $item_single->dimension_unit,
                    'weight_unit' => $item_single->weight_unit,
                    'weight' => $item_single->weight,
                    'quantity' => $item_single->quantity,
                    'variants' => json_decode($item_single->variants,true),
                    'attributes' => json_decode($item_single->attributes,true),
                    'active' => $item_single->active,
                    'inventory_type'=>'Single',
                    'thumbnail_image' => $thumbnail_image,
                    'newly_added' => $item_single->newly_added,
                ));
            }

        }
        
        return response()->json($items)->header('X-Total-Count', $count);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }


    /**
     * Create Multiple Items.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ItemCreate(Request $request)
    {
        DB::beginTransaction();
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'product_id' => 'required',
            'items.*.sku' => 'required|regex:/^\S+\w/|distinct|max:255',
            'items.*.mrp' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.price' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.length' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.breadth' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.height' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.dimension_unit' => 'required',
            'items.*.weight_unit' => 'required',
            'items.*.weight' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.quantity' => 'required|integer',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'Validation error while creating Item');
            return response()->json($error_obj, 400);
        }


        $items_existing=Item::where('product_id',$input_array['product_id'])->get(['sku','id']); 
        $deleted_sku=[];       
        foreach ($input_array['items'] as $item_input) {
            $exist=false;
            $item_id = null;
            //check if SKU already exist or not 
            
            foreach($items_existing as $item_exist) {
                if($item_exist['sku']==$item_input['sku']) {
                    $exist=true;
                    $item_id=$item_exist['id'];
                    $removable_id=array_search($item_exist['id'],$deleted_sku,true);
                    array_splice($deleted_sku, $removable_id, 1);
                }
                else {
                    $addable_id=array_search($item_exist['id'],$deleted_sku,true);
                    if(!$addable_id) {
                        array_push($deleted_sku,$item_exist['id']);
                    }
                    
                }
                
            }

            if($exist) {
                $item= Item::find($item_id);
            }
            else {
                // add data 
                $item= new Item;
                $item->sku= $item_input['sku'];
                $item->product_id= $input_array['product_id'];
            }
            
            $item->mrp= $item_input['mrp'];
            $item->price= $item_input['price'];
            $item->dimentions= $item_input['length'].'*'.$item_input['breadth'].'*'.$item_input['height'];
            $item->dimension_unit= $item_input['dimension_unit'];
            $item->weight= $item_input['weight'];
            $item->weight_unit= $item_input['weight_unit'];
            $item->inventory_location= $item_input['inventory_location'];
            if($item->quantity!=$item_input['quantity'])
            {
               $item->inventory_updated_at=Carbon::now();
            }
            $item->quantity= $item_input['quantity'];
            $item->active=isset($item_input['active']) ? $item_input['active'] : false;
            $item->variants=isset($item_input['variants']) ? json_encode($item_input['variants']) : null;
            $item->attributes=isset($item_input['attributes']) ? json_encode($item_input['attributes']) : null;
            $item->save();
        }

        // delete SKUs that not present in the current list 
        Item::whereIn('id',$deleted_sku)->delete();

        // Commit Transaction
        DB::commit();
        return response()->json(["status" => "success","message" => "Successfully Item Updated"],200);
        }
    catch(\Exception $e) {
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
    public function ItemShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $item=Item::find($id);
        if($item->inventory_type=='1'){
           $min_quantities=[];
           $combo_all_items=[];
           foreach($item->combo_items as $combo_item){
            $combo_single_item=$combo_item->child_item;
            $min_quantities[]=(int)($combo_single_item->quantity/$combo_item->quantity);
            $combo_single_item=$combo_item->child_item;
            $combo_all_items[]=[
                'status' => "success",
                'id' => $combo_single_item->id,
                'product_id' => $combo_single_item->product_id,
                'product_name' => $combo_single_item->product->name,
                'product_sku' => $combo_single_item->product->sku,
                'product_category_id' => $combo_single_item->product->category->parent_category_id,
                'product_category_name' => Category::find($combo_single_item->product->category->parent_category_id)->name,
                'product_subcategory_id' => $combo_single_item->product->category->id,
                'hsn_code' => $combo_single_item->product->hsn_code,
                'tax_rate' => $combo_single_item->product->tax_rate,
                'product_subcategory_name' => $combo_single_item->product->category->name,
                'product_name_with_sku' => $combo_single_item->sku,
                'product_brand_id' => $combo_single_item->product->brand->id,
                'product_brand_name' => $combo_single_item->product->brand->name,
                'sku' => $combo_single_item->sku,
                'inventory_location' => $combo_single_item->inventory_location,
                'mrp' => $combo_single_item->mrp,
                'unit_price' => $combo_single_item->price,
                'dimension_unit' => $combo_single_item->dimension_unit,
                'weight_unit' => $combo_single_item->weight_unit,
                'weight' => $combo_single_item->weight,
                'quantity' => $combo_item->quantity,
                'variants' => json_decode($combo_single_item->variants,true),
                'attributes' => json_decode($combo_single_item->attributes,true),
                'active' => $combo_single_item->active,
                'inventory_type'=>'Combo',
                 ];
           
           }

            return response()->json([
            'price' => $item->price,
            'quantity' => min($min_quantities),'combo_items'=>$combo_all_items
            ]);
        }
        // Dimentions breakdown
        $dimention_array=explode('*',$item->dimentions);
        if(!count($dimention_array)) {
            $dimention_array=explode('X',$item->dimentions);
        }
        $length=0;
        $breadth=0;
        $height=0;
        if(count($dimention_array)==3) {
            $length= $dimention_array[0];
            $breadth= $dimention_array[1];
            $height= $dimention_array[2];
        }
        $thumbnail_image=null;
        $pic_arr=json_decode($item->product->pictures,true);
        if(isset($pic_arr['images']) && count($pic_arr['images'])) {
            $thumbnail_image ='https://storage.googleapis.com/'.$pic_arr['bucket'].'/'.$pic_arr['client'].'/'.$pic_arr['folder'].'/'.$pic_arr['images'][0]['thumbnail_image_name'];
        }
        else {
            $thumbnail_image ='https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png';
            }

        return response()->json([
            'status' => "success",
            'id' => $item->id,
            'product_id' => $item->product_id,
            'product_name' => $item->product->name,
            'product_sku' => $item->product->sku,
            'product_category_id' => $item->product->category->parent_category_id,
            'product_category_name' => Category::find($item->product->category->parent_category_id)->name,
            'product_subcategory_id' => $item->product->category->id,
            'product_hsn_code' => $item->product->hsn_code,
            'product_tax_rate' => $item->product->tax_rate,
            'product_subcategory_name' => $item->product->category->name,
            'product_name_with_sku' => $item->sku,
            'product_brand_id' => $item->product->brand->id,
            'product_brand_name' => $item->product->brand->name,
            'sku' => $item->sku,
            'inventory_location' => $item->inventory_location,
            'mrp' => $item->mrp,
            'price' => $item->price,
            'length' => $length,
            'breadth' => $breadth,
            'height' => $height,
            'dimension_unit' => $item->dimension_unit,
            'weight_unit' => $item->weight_unit,
            'weight' => $item->weight,
            'quantity' => $item->quantity,
            'variants' => json_decode($item->variants,true),
            'attributes' => json_decode($item->attributes,true),
            'active' => $item->active,
            'thumbnail_image' => $thumbnail_image,
            'inventory_type'=>'Single',
            'amazon_sku_alias' => $item->amazon_sku_alias,
            'flipkart_sku_alias' => $item->flipkart_sku_alias
        ]);
     }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Item edit.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ItemEdit(Request $request,$id)
    {
        try {
        $item= Item::find($id);
        if($item->inventory_type=='1'){

            $input_array = $request->json()->all();
            $input_array = $request->json()->all();
            $validation = Validator::make($input_array, [
            'price' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            ]);
            if ($validation->fails()) {
                $error_obj = array('status' => 'fail', 'message' => $validation->errors()->first() );
                return response()->json($error_obj, 405);
            }
            $item->price= $input_array['price'];
            $item->save();
            return response()->json(['status' => "success","message" => "Successfully Item Updated"],200);

        }else{

            $input_array = $request->json()->all();
            $rules= [
                'mrp' => 'required|regex:/^\d+(\.\d{1,2})?$/',
                'price' => 'required|regex:/^\d+(\.\d{1,2})?$/',
                'items.*.length' => 'required|regex:/^\d+(\.\d{1,2})?$/',
                'items.*.breadth' => 'required|regex:/^\d+(\.\d{1,2})?$/',
                'items.*.height' => 'required|regex:/^\d+(\.\d{1,2})?$/',
                'items.*.dimension_unit' => 'required',
                'items.*.weight_unit' => 'required',
                'quantity' => 'required|integer',
                'amazon_sku_alias'   =>  [
                      'nullable',
                       Rule::unique('items')->ignore($item->id)
                ],
                'flipkart_sku_alias' => [
                    'nullable',
                     Rule::unique('items')->ignore($item->id)
                ],
            ];

           $validation = Validator::make($input_array,$rules);
           if ($validation->fails()) {
             $error_obj = array('status' => 'fail', 'message' =>  $validation->errors()->first());
             return response()->json($error_obj, 405);
           }

           $item->mrp= $input_array['mrp'];
           $item->price= $input_array['price'];
           $item->dimentions= $input_array['length'].'*'.$input_array['breadth'].'*'.$input_array['height'];
           $item->dimension_unit= $input_array['dimension_unit'];
           $item->weight= $input_array['weight'];
           $item->inventory_location= $input_array['inventory_location'];
           $item->weight_unit= $input_array['weight_unit'];
           if($item->quantity!=$input_array['quantity'])
           {
               $item->inventory_updated_at=Carbon::now();
               $item->newly_added = false;
           }
           if(isset($input_array["flipkart_sku_alias"])){
               $item->flipkart_sku_alias = $input_array["flipkart_sku_alias"];
           }
           if(isset($input_array["amazon_sku_alias"])){
               $item->amazon_sku_alias = $input_array["amazon_sku_alias"];
           }
           

           $item->updateQuantityWithLog($input_array['quantity'], "Direct edit");
           $item->active=isset($input_array['active']) ? $input_array['active'] : false;
           $item->variants=isset($input_array['variants']) ? json_encode($input_array['variants']) : null;
           $item->attributes=isset($input_array['attributes']) ? json_encode($input_array['attributes']) : null;
           $item->save();
           return response()->json(['status' => "success","message" => "Successfully Item Updated"],200);
         }
      }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Delete Product.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ItemDelete($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $item = Item::find($id);
        $item->delete();
        return response()->json(["status" => "success","message" => "Successfully Item Deleted"],200);

        }

    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

 /**
     * Edit Multiple Items by product id.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ItemBulkEdit(Request $request,$id)
    {
        DB::beginTransaction();
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'items.*.sku' => 'required|regex:/^\S+\w/|distinct|max:255',
            'items.*.mrp' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.price' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.length' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.breadth' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.height' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.dimension_unit' => 'required',
            'items.*.weight_unit' => 'required',
            'items.*.weight' => 'required|regex:/^\d+(\.\d{1,2})?$/',
            'items.*.quantity' => 'required|integer',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'Validation error while updating Item');
            return response()->json($error_obj, 400);
        }


        $items_existing=Item::where('product_id',$id)->get(['sku','id']); 
        $deleted_sku=[];       
        foreach($items_existing as $item_exist) {
            array_push($deleted_sku,$item_exist['id']);
        }

        foreach ($input_array['items'] as $item_input) {
            $exist=false;
            $item_id = null;
            //check if SKU already exist or not 
            
            foreach($items_existing as $item_exist) {
                if($item_exist['sku']==$item_input['sku']) {
                    $exist=true;
                    $item_id=$item_exist['id'];
                    $removable_id=array_search($item_exist['id'],$deleted_sku,true);
                    array_splice($deleted_sku, $removable_id, 1);
                break;
                } 
            }

            if($exist) {
                $item= Item::find($item_id);
            }
            else {
                // add data 
                $item= new Item;
                $item->sku= $item_input['sku'];
                $item->product_id= $id;
            }
            
            $item->mrp= $item_input['mrp'];
            $item->price= $item_input['price'];
            $item->dimentions= $item_input['length'].'*'.$item_input['breadth'].'*'.$item_input['height'];
            $item->dimension_unit= $item_input['dimension_unit'];
            $item->weight= $item_input['weight'];
            $item->weight_unit= $item_input['weight_unit'];
            $item->inventory_location= $item_input['inventory_location'];
            if($item->quantity!=$item_input['quantity'])
            {
               $item->inventory_updated_at=Carbon::now();
            }
            $item->updateQuantityWithLog($item_input['quantity'], "Bulk edit");
            $item->active=isset($item_input['active']) ? $item_input['active'] : false;
            $item->variants=isset($item_input['variants']) ? json_encode($item_input['variants']) : null;
            $item->attributes=isset($item_input['attributes']) ? json_encode($item_input['attributes']) : null;
            $item->flipkart_sku_alias =  $item_input["flipkart_sku_alias"];
            $item->amazon_sku_alias =  $item_input["amazon_sku_alias"];
            $item->save();
        }

        // delete SKUs that not present in the current list 
        Item::whereIn('id',$deleted_sku)->delete();

        // Commit Transaction
        DB::commit();
        return response()->json(["status" => "success","message" => "Successfully Item Updated","Deleted SKU" => $deleted_sku],200);
        }
    catch(\Exception $e) {
        // Rollback Transaction
        DB::rollback();
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

     /**
     * Show Items by product id.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ItemBulkShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        $items=[];
        $items_list=Item::where('product_id',$id)->get();
        $items['id']=$id;
        $items['status']='success';
        $items['items']=[];
        foreach ($items_list as $item_single) {
             // Dimentions breakdown
             $dimention_array=explode('*',$item_single->dimentions);
            if(count($dimention_array) < 2) {
                $dimention_array=explode('X',$item_single->dimentions);
            }

            $length=0;
            $breadth=0;
            $height=0;
            if(count($dimention_array)==3) {
                $length= $dimention_array[0];
                $breadth= $dimention_array[1];
                $height= $dimention_array[2];
            }
                  
            array_push($items['items'],array(
                'id' => $item_single->id,
                'product_id' => $item_single->product_id,
                'product_name' => $item_single->product->name,
                'product_sku' => $item_single->product->sku,
                'product_category_id' => $item_single->product->category->parent_category_id,
                'product_category_name' => Category::find($item_single->product->category->parent_category_id)->name,
                'product_subcategory_id' => $item_single->product->category->id,
                'product_subcategory_name' => $item_single->product->category->name,
                'product_brand_id' => $item_single->product->brand->id,
                'product_brand_name' => $item_single->product->brand->name,
                'sku' => $item_single->sku,
                'mrp' => $item_single->mrp,
                'price' => $item_single->price,
                'length' => $length,
                'breadth' => $breadth,
                'height' => $height,
                'dimension_unit' => $item_single->dimension_unit,
                'weight_unit' => $item_single->weight_unit,
                'inventory_location' => $item_single->inventory_location,
                'weight' => $item_single->weight,
                'quantity' => $item_single->quantity,
                'variants' => json_decode($item_single->variants,true),
                'attributes' => json_decode($item_single->attributes,true),
                'active' => $item_single->active,
                'amazon_sku_alias' => $item_single->amazon_sku_alias,
                'flipkart_sku_alias' => $item_single->flipkart_sku_alias
            ));
        }
        return response()->json($items)->header('X-Total-Count', 2);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    public function ItemQuickShow(Request $request, $id){
        try {
            $item= Item::find($id);

            $data = [
                'id'       =>  $item->id,
                'sku'      =>  $item->sku,
                'quantity' =>  $item->quantity,
                'price'    =>  $item->price
            ];

            return response()->json($data, 200);

        }catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
         }

    }

    public function ItemQuickEdit(Request $request, $id){

        try {

            $inputs  =  $request->all();
            $validation = Validator::make($inputs, [
                'id'       => 'required|exists:items,id',
                'sku'      => 'required|regex:/^\S+\w/|distinct|max:255',
                'price'    => 'required|regex:/^\d+(\.\d{1,2})?$/',
                'quantity' => 'required|integer',
            ]);
            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => $errors->first() );
                return response()->json($error_obj, 400);
            }
            $item= Item::find($id);
            $item->updateQuantityWithLog($inputs['quantity'], "Quick edit");
            $item->price    = $inputs['price'];
            $item->save();
            return response()->json(['status' => 'failed', 'message' => 'successfully item updated']);
        }catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
         }

    }

}
