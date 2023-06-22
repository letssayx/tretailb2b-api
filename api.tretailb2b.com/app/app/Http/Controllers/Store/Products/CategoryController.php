<?php

namespace App\Http\Controllers\Store\Products;

use App\User;
use App\Store\Category;
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


class CategoryController extends Controller
{
    
    /**
     * Get  Categories.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function CategoryList()
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
        $category= Category::where('parent_category_id',null)->where('name', 'not like', '%'.'undefined'.'%')->get();
        return response()->json($category)->header('X-Total-Count', 2);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }


    /**
     * Create Category.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function CategoryCreate(Request $request)
    {
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }
        // add data 
        $category= new Category;
        $category->name= $input_array['name'];
        $category->save();
        return response()->json(["status" => "success","message" => "Successfully Category Created","id" => $category->id],201);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Show Category.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function CategoryShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $category=Category::find($id);

        return response()->json([
            'status' => "success",
            'id' => $category->id,
            'name' => $category->name
        ]);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Create Category.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function CategoryEdit(Request $request,$id)
    {
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }
        // add data 
        $category= Category::find($id);
        $category->name= $input_array['name'];
        $category->save();
        return response()->json(['status' => "success","message" => "Successfully Category Updated"],200);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Delete Category.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function CategoryDelete($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $category = Category::find($id);
        $category->delete();
        return response()->json(["status" => "success","message" => "Successfully Category Deleted"],200);

        }

    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }



       /**
     * Get  SubCategories.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SubCategoryList($id)
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
        $category= Category::where('parent_category_id',$id)->get();
        return response()->json($category)->header('X-Total-Count', 2);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }


           /**
     * Get  SubCategories list with filter 
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SubCategoryListFilter(Request $request)
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
        $query = $request->all();
        $filter=json_decode($query['filter'],true);
        $category= Category::where('parent_category_id',isset($filter['category_id']) ? $filter['category_id'] : ! NULL )->get();
        return response()->json($category)->header('X-Total-Count', 2);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }


    /**
     * Create SubCategory.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SubCategoryCreate(Request $request)
    {
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name'        => 'required',
            'category_id' => 'required|numeric',
            'tax_rate'    => 'required|numeric|between:0,99.99'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }
        // add data 
        $category = new Category;
        $category->name     = $input_array['name'];
        $category->tax_rate = $input_array['tax_rate'];
        $category->parent_category_id= $input_array['category_id'];
        $category->save();
        return response()->json(["status" => "success","message" => "Successfully Subcategory Created","id" => $category->id],201);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Show SubCategory.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SubCategoryShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $category=Category::find($id);

        return response()->json([
            'status' => "success",
            'id' => $category->id,
            'name' => $category->name
        ]);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Create Category.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SubCategoryEdit($pid,Request $request,$id)
    {
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }
        // add data 
        $category= Category::find($id);
        $category->name= $input_array['name'];
        $category->save();
        return response()->json(['status' => "success","message" => "Successfully SubCategory Updated"],200);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Delete SubCategory.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SubCategoryDelete($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $category = Category::find($id);
        $category->delete();
        return response()->json(["status" => "success","message" => "Successfully SubCategory Deleted"],200);

        }

    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    public function TaxRate(Request $request, $id){
        try {
            $category=Category::where('id', $id)
                      ->where('parent_category_id', '<>', null)
                      ->first();

            if($category){
               return response()->json([
                   'status'   => "success",
                   'id'       => $category->id,
                   'name'     => $category->name ,
                   'tax_rate' => $category->tax_rate,
               ]);
            }
        } catch (\Exception $e) {
            $error_obj = array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }
  
}
