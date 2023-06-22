<?php

namespace App\Http\Controllers\Store\Products;

use App\User;
use App\Store\Brand;
use App\Store\Manufacturer;
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


class ManufacturerController extends Controller
{
    
    /**
     * Get  Brands.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ManufacturerList(Request $request)
    {
        try {
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
        $total_manufacturers_count=0;
        $manufacturer=[];
        //$api_auth = App::make(ApiAuth::class);
        if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
            if(isset($filter['q']) && !empty($filter['q'])) {
                $manufacturer= Manufacturer::where('name', 'like', '%'.$filter['q'].'%')->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->where('name', 'not like', '%'.'undefined'.'%')->where('name', 'not like', '%'.'Uncategorised'.'%')->get();
                $total_manufacturers_count= Manufacturer::select(DB::raw('count(*) as total_count'))->where('name', 'like', '%'.$filter['q'].'%')->where('name', 'not like', '%'.'undefined'.'%')->where('name', 'not like', '%'.'Uncategorised'.'%')->first();
            }
            else {
                $manufacturer= Manufacturer::orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->where('name', 'not like', '%'.'undefined'.'%')->where('name', 'not like', '%'.'Uncategorised'.'%')->get();
                $total_manufacturers_count= Manufacturer::select(DB::raw('count(*) as total_count'))->where('name', 'not like', '%'.'undefined'.'%')->where('name', 'not like', '%'.'Uncategorised'.'%')->first();
            } 
                     
        }
        else {
            $manufacturer=Manufacturer::where('name', 'not like', '%'.'undefined'.'%')->where('name', 'not like', '%'.'Uncategorised'.'%')->get();
            $total_manufacturers_count= Manufacturer::select(DB::raw('count(*) as total_count'))->where('name', 'not like', '%'.'undefined'.'%')->where('name', 'not like', '%'.'Uncategorised'.'%')->first();
        }
       
        return response()->json($manufacturer)->header('X-Total-Count', isset($total_manufacturers_count->total_count) ? $total_manufacturers_count->total_count : 0);
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
    public function ManufacturerCreate(Request $request)
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
        $manufacturer= new Manufacturer;
        $manufacturer->name= $input_array['name'];
        $manufacturer->save();
        return response()->json(["status" => "success","message" => "Successfully Manufacturer Created","id" => $manufacturer->id],201);
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
    public function ManufacturerShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $manufacturer=Manufacturer::find($id);

        return response()->json([
            'status' => "success",
            'id' => $manufacturer->id,
            'name' => $manufacturer->name
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
    public function ManufacturerEdit(Request $request,$id)
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
        $manufacturer= Manufacturer::find($id);
        $manufacturer->name= $input_array['name'];
        $manufacturer->save();
        return response()->json(['status' => "success","message" => "Successfully Manufacturer Updated"],200);
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
    public function ManufacturerDelete($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $manufacturer = Manufacturer::find($id);
        $manufacturer->delete();
        return response()->json(["status" => "success","message" => "Successfully Manufacturer Deleted"],200);

        }

    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }



  
}
