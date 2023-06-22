<?php

namespace App\Http\Controllers\Store\Teams;

use App\User;
use App\Verification;
use App\Client;
use App\Role;
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
use Illuminate\Support\Facades\Mail;
use App\Mail\UserSignup;
use App\Mail\RevokeTeam;


class TeamController extends Controller
{
    
    /**
     * Get  Brands.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function TeamList(Request $request)
    {
        try {
        $api_auth = App::make(ApiAuth::class);
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
        
        $total_teams_count=0;
        $team=[];
        $team_output=[];
        $client=Client::find($api_auth->user()->client_id);
        if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
            if(isset($filter['q']) && !empty($filter['q'])) {
                $team= $client->users()->where('users.name', 'like', '%'.$filter['q'].'%')->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                $total_teams_count= $client->users()->select(DB::raw('count(*) as total_count'))->where('users.name', 'like', '%'.$filter['q'].'%')->first();
            }
            else {
                $team= $client->users()->where('users.id', '<>', $api_auth->user()->user_id)->orderBy('users.'.$sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                //$total_teams_count= $client->users()->select(DB::raw('count(*) as total_count'))->first();
            } 
            
        }
        else {
            $team=$client->users();
            $total_teams_count= $client->users()->select(DB::raw('count(*) as total_count'))->first();
        }
        foreach($team as $t) {
            //$permissions=json_decode($t->role->permissions,true);

            array_push($team_output,array(
                'status' => "success",
                'id' => $t->role->id,
                'name' => $t->name,
                'email' => $t->email
            ));
        }
        
        return response()->json($team_output)->header('X-Total-Count', isset($total_teams_count->total_count) ? $total_teams_count->total_count : 10);
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
    public function TeamCreate(Request $request)
    {
        try {
        $api_auth = App::make(ApiAuth::class);    
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'name' => 'required',
            'email' => 'required'
        ]);
        $new_user=false;
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'Validation Error');
            return response()->json($error_obj, 400);
        }
        // check that user if present in db 
        $user=User::where('email',$input_array['email'])->first();
        if(!$user) {
            $user= new User;
            $user->name=$input_array['name'];
            $user->email=$input_array['email'];
            $user->save();
            $new_user=true;
        }
        // check if the user already has role for this store 
        $exist_role=Role::where('client_id',$api_auth->user()->client_id)->where('user_id',$user->id)->first();
        if($exist_role) {
            $error_obj=array('status'=>'fail','message'=> 'Role already exist');
            return response()->json($error_obj,400);
        }
        // Add role 
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
        }
        if(isset($input_array['orders'])){
            $permissions['orders']=$input_array['orders'];
            $permissions['customers']=$permissions['orders'];
        }
        if(isset($input_array['settings']) && $input_array['settings']=='POST'){
            $permissions['settings']='POST';
            $permissions['tasks']='POST'; 
            $permissions['logs']='POST';

        }

        // add data 
        $role= new Role;
        $role->user_id= $user->id;
        $role->client_id= $api_auth->user()->client_id;
        $role->permissions= json_encode($permissions);
        $role->save();  
        
        
        if($new_user) {
            $email_validation_token=Str::random(30);
            // Send New user registration email 
            $verification_link = env('USER_SIGNUP_VERIFICATION_URL')."?token=".$email_validation_token;
            Mail::to($user->email)->send(new UserSignup($verification_link,$api_auth->user()->client_details['name']));
            // Add request to verification table 
            
            $verification=new Verification;
            $verification->email=$input_array['email'];
            $verification->validation_token=$email_validation_token;
            $verification->type='NEW'; // NEW - New User added from store owner
            $verification->valid_to=Carbon::now()->addDay(1); //24 hrs validity 
            $verification->save();
        }
        
        return response()->json(["status" => "success","message" => "Successfully User Added","id" => $role->id],201);
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
    public function TeamShow($id)
    {
        try {
        $api_auth=App::make(ApiAuth::class);
        
        $role=Role::where('id',$id)->where('client_id',$api_auth->user()->client_id)->where('user_id', '<>', $api_auth->user()->user_id)->first();
        if(!$role) {
            $error_obj=array('status'=>'fail','message'=> 'Unauthorized for this route');
            return response()->json($error_obj,405);
        }
        $user=User::find($role->user_id);

        $permissions=json_decode($role->permissions,true);

        return response()->json([
            'status' => "success",
            'id' => $role->id,
            'name' => $user->name,
            'email' => $user->email,
            'products' => isset($permissions['products']) ? $permissions['products'] : 'none',
            'orders' => isset($permissions['orders']) ? $permissions['orders'] : 'none',
            'settings' => isset($permissions['settings']) ? $permissions['settings'] : 'none'
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
    public function TeamEdit(Request $request,$id)
    {
        try {
        $input_array = $request->json()->all();
        $api_auth=App::make(ApiAuth::class);
        
        $role=Role::where('id',$id)->where('client_id',$api_auth->user()->client_id)->where('user_id', '<>', $api_auth->user()->user_id)->first();
        if(!$role) {
            $error_obj=array('status'=>'fail','message'=> 'Unauthorized for this route');
            return response()->json($error_obj,405);
        }
        
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
         }
         if(isset($input_array['orders'])){
             $permissions['orders']=$input_array['orders'];
             $permissions['customers']=$permissions['orders'];
         }
         if(isset($input_array['settings']) && $input_array['settings']=='POST'){
             $permissions['settings']='POST';
             $permissions['tasks']='POST'; 
             $permissions['logs']='POST';
 
         }
       
         $role->permissions= json_encode($permissions);
         $role->save();  
        return response()->json(['status' => "success","message" => "Successfully Role Updated"],200);
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
    public function TeamDelete($id)
    {
        try {
        DB::beginTransaction();
        $api_auth=App::make(ApiAuth::class);
        
        $role=Role::where('id',$id)->where('client_id',$api_auth->user()->client_id)->where('user_id', '<>', $api_auth->user()->user_id)->first();
        if(!$role) {
            $error_obj=array('status'=>'fail','message'=> 'Unauthorized for this route');
            return response()->json($error_obj,405);
        }
        $admin  = User::find( $api_auth->user()->user_id);
        $user   = $role->user;
        $client = $role->client;
        $role->delete();
        Mail::to($user->email)->send( new RevokeTeam($admin, $user, $client) );
        DB::commit();
        return response()->json(["status" => "success","message" => "Successfully Role Deleted"],200);

        }

    catch(\Exception $e) {
        DB::rollback();
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }



  
}
