<?php

namespace App\Http\Controllers;

use App\User;
use App\Request as SignupRequest;
use App\Client;
use App\Role;
use App\Store\GstAdd;
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
use Artisan;
use App\Jobs\ProcessSignup;


class AdminController extends Controller
{
    /**
     * Get All User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function UserList(Request $request)
    {
        try {
            $api_auth=App::make(ApiAuth::class);
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
            $total_users_count=0;
            $user=[];

            //$user =User::get();
            if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
                if(isset($filter['q']) && !empty($filter['q'])) {
                    $user= User::where('name', 'like', '%'.$filter['q'].'%')->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                    $total_users_count= User::select(DB::raw('count(*) as total_count'))->where('name', 'like', '%'.$filter['q'].'%')->first();
                }
                else {
                    $user= User::orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                    $total_users_count= User::select(DB::raw('count(*) as total_count'))->first();
                } 
                         
            }
            else {
                $user= User::get();
                $total_users_count= User::select(DB::raw('count(*) as total_count'))->first();
            }
            return response()->json($user)->header('X-Total-Count', isset($total_users_count->total_count) ? $total_users_count->total_count : 0);
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
    public function UserCreate(Request $request)
    {
        try {
        $api_auth=App::make(ApiAuth::class);
        if(!$api_auth->user()->super_admin) {
            $error_obj=array('status'=>'fail','message'=> 'Access Denied: Unauthorized route access. User not Super-Admin.','data' => $api_auth->user());
            return response()->json($error_obj,405);
        }
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name' => 'required',
            'email' => 'required',
            'password' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }
        // add data 

        $user= new User;
        $user->name= $input_array['name'];
        $user->email= $input_array['email'];
        $user->password = Hash::make($input_array['password']);
        $user->active = isset($input_array['active']) ? $input_array['active'] : false;
        $user->is_admin = isset($input_array['is_admin']) ? $input_array['is_admin'] : false;
        $user->save();
        return response()->json(["status" => "success","message" => "User created successfully.","id" => $user->id],201);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Show User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function UserShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $user=User::find($id);

        return response()->json([
            'status' => "success",
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => $user->is_admin,
            'active' => $user->active
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
    public function UserEdit(Request $request,$id)
    {
        try {
        $api_auth=App::make(ApiAuth::class);
        if(!$api_auth->user()->super_admin) {
            $error_obj=array('status'=>'fail','message'=> 'Access Denied: Unauthorized route access. User not Super-Admin.');
            return response()->json($error_obj,405);
        }
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name' => 'required',
            'email' => 'required',
            'password' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }
        // add data 
        $user= User::find($id);
        $user->name= $input_array['name'];
        $user->email= $input_array['email'];
        $user->password = Hash::make($input_array['password']);
        $user->active = isset($input_array['active']) ? $input_array['active'] : false;
        $user->is_admin = isset($input_array['is_admin']) ? $input_array['is_admin'] : false;
        $user->save();
        return response()->json(['status' => "success","message" => "Successfully User Updated"],200);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }



    /**
     * Get All Client.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ClientList(Request $request)
    {
        try {
            $api_auth=App::make(ApiAuth::class);
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
            $total_clients_count=0;
            $client=[];
            if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
                if(isset($filter['q']) && !empty($filter['q'])) {
                    $client= Client::where('name', 'like', '%'.$filter['q'].'%')->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                    $total_clients_count= Client::select(DB::raw('count(*) as total_count'))->where('name', 'like', '%'.$filter['q'].'%')->first();
                }
                else {
                    $client= Client::orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                    $total_clients_count= Client::select(DB::raw('count(*) as total_count'))->first();
                } 
                         
            }
            else  {
                $client = Client::get();
                $total_clients_count= Client::select(DB::raw('count(*) as total_count'))->first();
            }
            
            return response()->json($client)->header('X-Total-Count', $total_clients_count->total_count ? $total_clients_count->total_count : 0);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
       
    }

        /**
     * Show Client.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ClientShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $client=Client::find($id);

        return response()->json($client);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Create Client.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ClientCreate(Request $request)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name' => 'required|regex:/\w/|unique:clients|max:255',
            'address' => 'required|max:255',
            'phone' => 'required|max:255',
            'email' => 'required|email'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }
        // create database & users associate with the database 
      

        $schemaName=$this->clean_str($input_array['name']);
        $db_user="tenant_".$schemaName;
        $db_pass= $this->password_generate(10);
        try {
            DB::statement('CREATE DATABASE IF NOT EXISTS '.$schemaName);
            DB::statement('CREATE USER IF NOT EXISTS \''.$db_user.'\'@\'%\' IDENTIFIED BY \''.$db_pass.'\'');
            DB::statement('GRANT ALL PRIVILEGES ON '.$schemaName.'.* TO \''.$db_user.'\'@\'%\'');
            // tenant DB migrations 
           
            DB::purge('mysql-null'); 
            \Config::set('database.connections.mysql-null', array(
                'driver'    => env('DB_CONNECTION', 'mysql'),
                'host'      => env('DB_HOST', '127.0.0.1'),
                'database'  => $schemaName,
                'username'  => $db_user,
                'password'  => $db_pass,
                'port'      => env('DB_PORT', '3306'),
                'unix_socket' => env('DB_SOCKET', ''),
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'prefix' => '',
                'prefix_indexes' => true,
                'strict' => true,
                'engine' => null,
            ));

            DB::reconnect('mysql-null');
            Artisan::call('migrate', [
                '--database'  => 'mysql-null',
                '--path'      => 'database/tenant-migrations',
                '--force'     => true,
            ]);

            // Add master table client info after successful creation 
            $client= new Client();
            $client->name= $input_array['name'];
            $client->address= $input_array['address'];
            $client->phone= $input_array['phone'];
            $client->email= $input_array['email'];
            $client->state=isset($input_array['state']) ? $input_array['state'] : false;
            $client->gstin=isset($input_array['gstin']) ? $input_array['gstin'] : false;
            $client->active=isset($input_array['active']) ? $input_array['active'] : false;
            //$client->db_host= $host;
            $client->db_name= $schemaName;
            $client->db_user= $db_user;
            $client->db_pass= $db_pass;
            $client->save();
       
            
        }
        catch(\Exception $e) {
            // Rollback delete database & user if exist 
            DB::connection()->statement('DROP DATABASE IF EXISTS '.$schemaName);
            DB::connection(env('DB_CONNECTION', 'mysql'))->statement('DROP USER IF EXISTS '.$db_user);
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

        return response()->json(['status' => "success","message" => "Successfully Client Created","id" => $client->id],201);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

        /**
     * Edit Client.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ClientEdit(Request $request,$id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'address' => 'required|max:255',
            'phone' => 'required|max:255',
            'email' => 'required|email',
            'migrate' => 'nullable|boolean'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }
        $client=Client::find($id);
        if(!$client) {
            $error_obj = array('status' => 'fail', 'message' => 'Client Not found');
            return response()->json($error_obj, 405);
        }
        $client->address=$input_array['address'];
        $client->phone=$input_array['phone'];
        $client->email=$input_array['email'];
        $client->state=isset($input_array['state']) ? $input_array['state'] : false;
        $client->gstin=isset($input_array['gstin']) ? $input_array['gstin'] : false;
        $client->active=isset($input_array['active']) ? $input_array['active'] : false;
        $client->save();
        // Migrate latest if set True
        if(isset($input_array['migrate']) && $input_array['migrate']==true) {
            try {
                // tenant DB migrations 
                DB::purge('mysql-null'); 
                \Config::set('database.connections.mysql-null', array(
                    'driver'    => env('DB_CONNECTION', 'mysql'),
                    'host'      => env('DB_HOST', '127.0.0.1'),
                    'database'  => $client->db_name,
                    'username'  => $client->db_user,
                    'password'  => $client->db_pass,
                    'port'      => env('DB_PORT', '3306'),
                    'unix_socket' => env('DB_SOCKET', ''),
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'prefix' => '',
                    'prefix_indexes' => true,
                    'strict' => true,
                    'engine' => null,
                ));
    
                DB::reconnect('mysql-null');
                Artisan::call('migrate', [
                    '--database'  => 'mysql-null',
                    '--path'      => 'database/tenant-migrations',
                    '--force'     => true,
                ]);
                
            }
            catch(\Exception $e) {
                // Rollback to previous version
                // Artisan::call('migrate:rollback', [
                //     '--database'  => 'mysql-null',
                //     '--path'      => 'database/tenant-migrations',
                //     '--force'     => true,
                // ]);
                $error_obj=array('status'=>'fail','message'=> $e->getMessage());
                return response()->json($error_obj,400);
            }
        }

        return response()->json(['status' => "success","message" => "Successfully Client Updated"],200);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

                /**
     * Show Role.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function RoleListFilter(Request $request)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        $query = $request->all();
        $client=null;
        $filter=json_decode($query['filter'],true);
        $output_roles=[];
        if(isset($filter['client_id'])) {
        $client=Client::find($filter['client_id']);
        }
        else {
            $client=Client::get();
        }
        foreach ($client->users as $user) {
            array_push($output_roles, array(
                'id' => $user->role->id,
                'user_id' => $user->id,
                'user' => $user->name,
                'user_email' => $user->email,
                'permissions' => json_decode($user->role->permissions,true),
                'primary_user'=> ($user->id==$client->primary_user_id?"primary":"")
            ));
        }

        return response()->json($output_roles)->header('X-Total-Count', 2);

        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }


    public function GstAddCreate(Request $request)
    
	{ try
        {
        $input_array=$request->json()->all();
        
       
         $fetchData=[];
         $id=[];
        // query the database and get all row, extract all row's ids and store in 
        
        foreach($input_array as $input)
        {   
            $rule=[
                'address'  =>'required',
                'gstNo'    =>'required',
                'phn_no'   =>'required',
            ];
            if(!isset($input['id']) ){
                 $rule['state']='required|unique:add_gst_table,state';    
            }else{
                 $rule['state']='required|unique:add_gst_table,state,'.$input['id'];
            }
            // return response()->json($input);
            $validation=Validator::make($input,$rule);
             if ($validation->fails()) {
                $error_obj = array('status' => 'fail', 'message' => 'Duplicate state could not added');
                return response()->json($error_obj);
             }
            if(isset($input['id']) && !empty($input['id'])){
               $gstData=GstAdd::find($input['id']);
               if(!empty($gstData)){
                $gstData->address  =$input['address'];
                $gstData->state    =$input['state'];
                $gstData->gstno    =$input['gstNo'];
                $gstData->phn_no   =$input['phn_no'];
                array_push($fetchData,$gstData->id);
                $gstData->save();
               }

            }else{
                 $gstData=new GstAdd;
                 $gstData->address  =$input['address'];
                 $gstData->state    =$input['state'];
                 $gstData->gstno    =$input['gstNo'];
                 $gstData->phn_no   =$input['phn_no'];
                 $gstData->save();
                 array_push($fetchData,$gstData->id);
                //  return response()->json($gstData);
            }
            //here collect the id from post input and store in array
            // if($fetchData==$id){
            //     DB::table('add_gst_table')->where($input_array['id'])->delete();
            // }
        }
       
        $deletedIds= GstAdd::whereNotIn('id',$fetchData)->delete();
          
         
        //compare two array of ids and find the ids which 
        //stored in database but not in input ids and store then in another array


        //write a delete query which will delete the calculated query
        // return response()->json($gstData);
        // return response()->json($deletedIds);
        return response()->json(["status" => "success","message" => "Successfully Updated","data"=>GstAdd::get()],200);

       }
       catch(Exception $e)
       {
           $error=array('status'=>'fail','message'=>$e->getMessage());
           return response()->json($error); 
       }
    }
    
    public function GstAddShow()
    {
        try {
            $gstData=GstAdd::get();
    
            return response()->json($gstData);
            }
        catch(Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }		
	
            /**
     * Show Role.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function RoleShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        $output_roles=[];
        $client=Client::find($id);
        foreach ($client->users as $user) {
            array_push($output_roles, array(
                'id' => $user->role->id,
                'user_id' => $user->id,
                'user' => $user->name,
                'user_email' => $user->email,
                'permissions' => json_decode($user->role->permissions,true)
            ));
        }

        return response()->json($output_roles)->header('X-Total-Count', 2);

        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

      /**
     * Create Role.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function RoleCreate(Request $request)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
 
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'client_id' => 'required',
            'user_id' => 'required',
            'primary_user' => 'boolean'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }

        //client check
        $client = Client::find($request->client_id);
        if(!$client){
            $error_obj=array('status'=>'fail','message'=> "Client not found");
            return response()->json($error_obj,400);
        }
        if(boolval($request->primary_user) == true && $client->primary_user_id != null){
            $error_obj=array('status'=>'fail','message'=> "Already have a primary user");
            return response()->json($error_obj,400);
        }
        // ProcessSignup::dispatch($request->all()) ;

        //Prepare module permissions json 
        $permissions=[];
        if(isset($input_array['products'])){
            $permissions['products']=$input_array['products'];
            //Add Sub endpoints related to products module 
            $permissions['brands']=$input_array['products'];
            $permissions['manufacturers']=$input_array['products'];
            $permissions['countries']=$input_array['products'];
            $permissions['categories']=$input_array['products'];
            $permissions['subcategories']=$input_array['products'];
            $permissions['items']=$input_array['products'];
            $permissions['bundles']=$input_array['products'];
            $permissions['transactions']=$input_array['products'];
            $permissions['analytics']=$input_array['products'];
            /* Kallol */
            $permissions['wms']=$input_array['products'];
        }
        if(isset($input_array['orders'])){
            $permissions['orders']    = $input_array['orders'];
            $permissions['customers'] = $permissions['orders'];
            $permissions['picklist']  = $input_array['orders'];
            $permissions['channels']  = $input_array['orders'];
            $permissions['returns'] = $input_array['orders'];
        }
        if(isset($input_array['settings']) && $input_array['settings']=='POST'){
            $permissions['settings']='POST';
            $permissions['tasks']='POST'; 
            $permissions['logs']='POST';
            $permissions['teams']='POST';

        }

        // add data 
    
        $role= new Role;
        $role->user_id = $input_array['user_id'];

        $role->client_id = $input_array['client_id'];
        $role->permissions = json_encode($permissions);
        $role->save();
        if($client->primary_user_id == null && boolval($request->primary_user) == true ){
           $client->primary_user_id = $role->user_id;
           $client->save();
        }
        return response()->json(["status" => "success","message" => "Successfully Role Created","id" => $role->id],201);

        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

                /**
     * Delete Role.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function RoleDelete($id,Request $request)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $role   = App\Role::find($id);
        $client = Client::find($role->client_id);
        if($client->primary_user_id!=$role->user_id)
          {
                $client->save();       
                $role->delete();      
        
            return response()->json(["status" => "success","message" => "Successfully Role Deleted"],200);
          }
            else{
             return response()->json(["status" => "fail","message" => " Primary user could not be  Delete"],405);
            }

           
        }  
      catch(Exception $e){
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
         return response()->json($error_obj,400); 
      }
    }

    /**
     * Get All Client.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function RequestList(Request $request)
    {
        try {
            $api_auth=App::make(ApiAuth::class);
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
            $total_requests_count=0;
            $request=[];
            if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
                if(isset($filter['q']) && !empty($filter['q'])) {
                    $request= SignupRequest::where('official_name', 'like', '%'.$filter['q'].'%')->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                    $total_requests_count= SignupRequest::select(DB::raw('count(*) as total_count'))->where('official_name', 'like', '%'.$filter['q'].'%')->first();
                }
                else {
                    $request= SignupRequest::orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                    $total_requests_count= SignupRequest::select(DB::raw('count(*) as total_count'))->first();
                } 
                         
            }
            else  {
                $request = SignupRequest::get();
                $total_requests_count= SignupRequest::select(DB::raw('count(*) as total_count'))->first();
            }
            
            return response()->json($request)->header('X-Total-Count', $total_requests_count->total_count ? $total_requests_count->total_count : 0);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
       
    }

          /**
     * Show requests.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function RequestShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $request=SignupRequest::find($id);

        return response()->json($request);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

      /**
     * Update Request.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function RequesUpdate(Request $request)
    {
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'request_id' => 'required',
            'action' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'Validation error');
            return response()->json($error_obj, 400);
        }
        // add data 
        $request=SignupRequest::find($input_array['request_id']);
        if($request && $input_array['action'] == 'accepted' && !$request->active && !empty($request->email_verified_at)) {
            // Create client along with primary user 
            // create database & users associate with the database 
            $schemaName=$this->clean_str($request->official_name);
            $db_user="tenant_".$schemaName;
            $db_pass= $this->password_generate(10);
            try {
                DB::statement('CREATE DATABASE IF NOT EXISTS '.$schemaName);
                DB::statement('CREATE USER IF NOT EXISTS \''.$db_user.'\'@\'%\' IDENTIFIED BY \''.$db_pass.'\'');
                DB::statement('GRANT ALL PRIVILEGES ON '.$schemaName.'.* TO \''.$db_user.'\'@\'%\'');
                // tenant DB migrations 
                DB::purge('mysql-null'); 
                \Config::set('database.connections.mysql-null', array(
                    'driver'    => env('DB_CONNECTION', 'mysql'),
                    'host'      => env('DB_HOST', '127.0.0.1'),
                    'database'  => $schemaName,
                    'username'  => $db_user,
                    'password'  => $db_pass,
                    'port'      => env('DB_PORT', '3306'),
                    'unix_socket' => env('DB_SOCKET', ''),
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'prefix' => '',
                    'prefix_indexes' => true,
                    'strict' => true,
                    'engine' => null,
                ));

                DB::reconnect('mysql-null');
                Artisan::call('migrate', [
                    '--database'  => 'mysql-null',
                    '--path'      => 'database/tenant-migrations',
                    '--force'     => true,
                ]);

                // Add master table client info after successful creation 
                DB::beginTransaction();
                try {
                //create superuser for that client 
                $user= new User;
                $user->name= $request->name;
                $user->email= $request->email;
                $user->password = $request->password;
                $user->active = true;
                $user->save();
                // Add client   
                $client= new Client();
                $client->name= $request->official_name;
                $client->address= $request->official_address;
                $client->phone= $request->official_phone;
                $client->email= $request->official_email;
                $client->state=isset($request->state) ? $request->state : false;
                $client->gstin=isset($request->gstin) ? $request->gstin : false;
                $client->active=true;
                //$client->db_host= $host;
                $client->db_name= $schemaName;
                $client->db_user= $db_user;
                $client->db_pass= $db_pass;
                $client->primary_user_id=$user->id;
                $client->save();
                
                //Create role for that user 
                //Prepare module permissions json 
                $permissions=[];
                $permissions['products']='POST';
                $permissions['brands']='POST';
                $permissions['manufacturers']='POST';
                $permissions['countries']='POST';
                $permissions['categories']='POST';
                $permissions['subcategories']='POST';
                $permissions['items']='POST';
                $permissions['orders']='POST';
                $permissions['customers']='POST';
                $permissions['settings']='POST';
                $permissions['tasks']='POST'; 
                $permissions['logs']='POST';
                $permissions['teams']='POST';
                $permissions['transactions']='POST';
                $permissions['returns']='POST';
                $permissions['bundles']='POST';
                $permissions['picklist']='POST';
                /* Kallol */
                $permissions['wms']='POST';
                // add data 
                $role= new Role;
                $role->user_id= $user->id;
                $role->client_id= $client->id;
                $role->permissions= json_encode($permissions);
                $role->save();
                $request->active= true;
                $request->save();
                DB::commit();
                }
                catch(\Exception $e) {
                    // Rollback Transaction
                   DB::connection(env('DB_CONNECTION', 'mysql'))->statement('DROP DATABASE IF EXISTS '.$schemaName);
                   DB::connection(env('DB_CONNECTION', 'mysql'))->statement('DROP USER IF EXISTS '.$db_user); 
                   DB::rollback();
                   $error_obj=array('status'=>'fail','message'=> $e->getMessage());
                   return response()->json($error_obj,400);
                 }

            }
            catch(\Exception $e) {
                // Rollback delete database & user if exist 
                DB::connection(env('DB_CONNECTION', 'mysql'))->statement('DROP DATABASE IF EXISTS '.$schemaName);
                DB::connection(env('DB_CONNECTION', 'mysql'))->statement('DROP USER IF EXISTS '.$db_user);
                $error_obj=array('status'=>'fail','message'=> $e->getMessage());
                return response()->json($error_obj,400);
            }
            return response()->json(['status' => "success","message" => "Client Approved"],200);
        }
        else {
            return response()->json(['status' => "fail","message" => "Validation Error(already active / email not verified)"],200);
        }
        
        
        
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    public function clean_str($string) 
    {
        $string = str_replace(' ', '_', $string); // Replaces all spaces with hyphens.
     
        return strtolower(preg_replace('/[^A-Za-z0-9\-]/', '', $string)); // Removes special chars & lower.
     }

    public function password_generate($chars) 
    {
       $data = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz';
       return substr(str_shuffle($data), 0, $chars);
     } 

}
