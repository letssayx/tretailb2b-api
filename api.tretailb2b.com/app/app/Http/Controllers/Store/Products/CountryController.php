<?php

namespace App\Http\Controllers\Store\Products;

use App\User;
use App\Store\Brand;
use App\Store\Country;
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


class CountryController extends Controller
{
    
    /**
     * Get  Brands.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function CountryList()
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
        $country=Country::where('name', 'not like', '%'.'undefined'.'%')->get();
        return response()->json($country)->header('X-Total-Count', 2);
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
    public function CountryCreate(Request $request)
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
        $country= new Country;
        $country->name= $input_array['name'];
        $country->save();
        return response()->json(["status" => "success","message" => "Successfully Country Created","id" => $country->id],201);
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
    public function CountryShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $country=Country::find($id);

        return response()->json([
            'status' => "success",
            'id' => $country->id,
            'name' => $country->name
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
    public function CountryEdit(Request $request,$id)
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
        $country= Country::find($id);
        $country->name= $input_array['name'];
        $country->save();
        return response()->json(['status' => "success","message" => "Successfully Country Updated"],200);
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
    public function CountryDelete($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $country = Country::find($id);
        $country->delete();
        return response()->json(["status" => "success","message" => "Successfully Country Deleted"],200);

        }

    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }



  
}
