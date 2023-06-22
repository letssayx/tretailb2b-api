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


class BrandController extends Controller
{
    
    /**
     * Get  Brands.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function BrandList(Request $request)
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
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
        
        $total_brands_count=0;
        $brand=[];
        if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
            if(isset($filter['q']) && !empty($filter['q'])) {
                $brand= Brand::where('name', 'like', '%'.$filter['q'].'%')->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->where('name', 'not like', '%'.'undefined'.'%')->get();
                $total_brands_count= Brand::select(DB::raw('count(*) as total_count'))->where('name', 'like', '%'.$filter['q'].'%')->where('name', 'not like', '%'.'undefined'.'%')->first();  
            }
            else {
                $brand= Brand::orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->where('name', 'not like', '%'.'undefined'.'%')->get();
                $total_brands_count= Brand::select(DB::raw('count(*) as total_count'))->where('name', 'not like', '%'.'undefined'.'%')->first();
                
            } 
            
        }
        else {
            $brand=Brand::where('name', 'not like', '%'.'undefined'.'%')->get();
            
            $total_brands_count= Brand::select(DB::raw('count(*) as total_count'))->where('name', 'not like', '%'.'undefined'.'%')->first();
        }
        
        return response()->json($brand)->header('X-Total-Count', isset($total_brands_count->total_count) ? $total_brands_count->total_count : 0);
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
    public function BrandCreate(Request $request)
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
        $brand= new Brand;
        $brand->name= $input_array['name'];
        $brand->save();
        return response()->json(["status" => "success","message" => "Successfully Brand Created","id" => $brand->id],201);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Show Product.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function BrandShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $brand=Brand::find($id);

        return response()->json([
            'status' => "success",
            'id' => $brand->id,
            'name' => $brand->name
        ]);
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
    public function BrandEdit(Request $request,$id)
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
        $brand= Brand::find($id);
        $brand->name= $input_array['name'];
        $brand->save();
        return response()->json(['status' => "success","message" => "Successfully Brand Updated"],200);
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
    public function BrandDelete($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $brand = Brand::find($id);
        $brand->delete();
        return response()->json(["status" => "success","message" => "Successfully Brand Deleted"],200);

        }

    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }



  
}
