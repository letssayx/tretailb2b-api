<?php

namespace App\Http\Controllers\Store\Orders;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

use Illuminate\Validation\Rule;

use App;
use App\User;
use App\Store\Customer;
use App\Helper\ApiAuth;
use App\Http\Middleware\TretailAuth;

use Carbon\Carbon;
use \Firebase\JWT\JWT;

class CustomerController extends Controller {

    /**
     * Get  Customers.
     *
     * @return \Illuminate\Http\JsonResponse
     */

     public function CustomerList(Request $request, String $type = null)
    {
        try {

        $query = $request->all();

        $sales_channels = ['amazon', 'flipkart'];

        if(isset($query['filter'])){
            $filter=json_decode($query['filter'],true);
        }
        if(isset($query['range'])){
            $range=json_decode($query['range'],true);
        }
        if(isset($query['sort'])){
            $sort=json_decode($query['sort'],true);
        }
        
        $total_customers_count = 0;
        $customer = [];
        $resp_obj = [];

        $customer_query = Customer::query();
        $count_customer_query = Customer::query();

        if( $type == 'b2b' ){

            $customer_query->where('customer_type', 'b2b');
            $count_customer_query->where('customer_type', 'b2b');

        }else if( $type == 'b2c' ){

            $customer_query->where('customer_type', 'b2c');
            $count_customer_query->where('customer_type', 'b2c');

        }else if( $type == 'marketplace'){
            
            $customer_query->whereIn('customer_type', $sales_channels);
            $count_customer_query->whereIn('customer_type', $sales_channels);
        }

        if( isset($range) && isset($sort) && count($range)==2 && count($sort)==2 ) {
            if(isset($filter['q']) && !empty($filter['q'])) {
                $customer = $customer_query->where('name', 'like', '%'.$filter['q'].'%')
                                           ->where('name', 'like', '%'.$filter['q'].'%')
                                           ->orWhere('phone','like','%'.$filter['q'].'%')
                                           ->orWhere('email','like', '%'.$filter['q'] .'%')
                                           ->orderBy($sort[0], $sort[1])
                                           ->offset($range[0])
                                           ->limit(($range[1]-$range[0])+1)
                                           ->get();
                $total_customers_count = $count_customer_query
                                         ->where('name', 'like', '%'.$filter['q'].'%')
                                         ->orWhere('phone','like','%'.$filter['q'].'%')
                                         ->orWhere('email','like', '%'.$filter['q'] .'%')
                                         ->count();
            }
            else {
                $customer = $customer_query->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                $total_customers_count = $count_customer_query->count();
            }        
        }
        else {
            if(isset($filter['id']) && !empty($filter['id'])) {
                $customer = $customer_query->whereIn('id', $filter['id'])->get();
                $total_customers_count = $customer_query->whereIn('id', $filter['id'])->count();
            }
            else {
                $customer = $customer_query->get();
                $total_customers_count = $customer_query->count();
            }
        }
         $customer = $customer->map(function( $element){
                      $element->email = $element->email?? '';
                      $element->phone = $element->phone?? '';
                      $element->name  = $element->name??  '';
                      return $element;
         });
         return response()->json( $customer )->header('X-Total-Count', isset($total_customers_count)? $total_customers_count : 0);

        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    /**
     * Create Customer.
     *
     * @return \Illuminate\Http\JsonResponse
     */

    public function CustomerCreate(Request $request)
    {
        try {
            // Get all data sent from front-end into an array
            $input_array = $request->json()->all();
            $api_auth = App::make(ApiAuth::class);    
            $user_details =  $api_auth->user();
            $users = DB::connection('mysql-src')->select("select * from users where id = ".$user_details->user_id."");
            // Validate the data received from front-end
            $validation = Validator::make($input_array, [
                'name'          => 'required',
                'email'         => 'required|unique:customers',
                'customer_type' => [
                    'required' ,
                    Rule::in(['b2b', 'b2c'])
                ]
            ]);
            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'Validation Error');
                return response()->json($error_obj, 405);
            }
            // Save validated data of newly created Customer to database
            $customer= new Customer;
            $customer->name= $input_array['name'];
            $customer->email= $input_array['email'];
            $customer->address=isset($input_array['address']) ? json_encode($input_array['address'],true) : null;
            $customer->phone=isset($input_array['phone']) ? $input_array['phone'] : null;
            $customer->state=isset($input_array['state']) ? $input_array['state'] : null;
            $customer->gstin=isset($input_array['gstin']) ? $input_array['gstin'] : null;
            $customer->active=isset($input_array['active']) ? $input_array['active'] : true;
            $customer->customer_type = isset($input_array['customer_type'])? $input_array['customer_type']: true;
            if(isset($users)){
                foreach($users as $user){
                    $customer->created_by = $user->name;
                }
            }
            $customer->save();
            // setcookie("customer_id", $customer->id);
            return response()->json(["status" => "success","message" => "Successfully Customer Created","id" => $customer->id],201);
        } catch(\Exception $e) {
            // Action to be taken if error occurs
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    /**
     * Show Customer.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    
     public function CustomerShow($id)
    {
        try {
            //$api_auth=App::make(ApiAuth::class);
            // Search for Customer to be shown whose id is passed as parameter
            $customer=Customer::find($id);
            // Return details of the customer found
            return response()->json([
                'status'        => "success",
                'id'            => $customer->id,
                'name'          => $customer->name,
                'email'         => $customer->email,
                'address'       => json_decode($customer->address,true),
                'phone'         => $customer->phone,
                'state'         => $customer->state,
                'gstin'         => $customer->gstin,
                'customer_type' => $customer->customer_type,
                'active'        => $customer->active,
            ]);
        } catch(\Exception $e) {
            // Action to be taken if error occurs
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    /**
     * Edit Customer.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    
     public function CustomerEdit(Request $request,$id)
    {
        try {
            // Get all data sent from front-end into an array
            $input_array = $request->json()->all();
            // Validate the data received from front-end
            $validation = Validator::make($input_array, [
                'name'          => 'required' ,
                'customer_type' => [
                    'required' ,
                    Rule::in(['b2b', 'b2c'])
                ]
            ]);
            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json($error_obj, 405);
            }
            // Save validated data of Customer to be updated to database
            $customer= Customer::find($id);
            $customer->name= $input_array['name'];
            $customer->address=isset($input_array['address']) ? json_encode($input_array['address'],true) : null;
            $customer->phone=isset($input_array['phone']) ? $input_array['phone'] : null;
            $customer->state=isset($input_array['state']) ? $input_array['state'] : null;
            $customer->gstin=isset($input_array['gstin']) ? $input_array['gstin'] : null;
            $customer->active=isset($input_array['active']) ? $input_array['active'] : true;
            $customer->customer_type = isset($input_array['customer_type'])? $input_array['customer_type']: true;
            $customer->save();
            return response()->json(['status' => "success","message" => "Successfully Customer Updated"],200);
        } catch(\Exception $e) {
            // Action to be taken if error occurs
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    /**
     * Delete Customer.
     *
     * @return \Illuminate\Http\JsonResponse
     */

    public function CustomerDelete($id)
    {
        try {
            //$api_auth=App::make(ApiAuth::class);
            // Search for Customer to be deleted whose id is passed as parameter
            $customer = Customer::find($id);
            $customer->delete();
            return response()->json(["status" => "success","message" => "Successfully Customer Deleted"],200);
        } catch(\Exception $e) {
            // Action to be taken if error occurs
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }
}
