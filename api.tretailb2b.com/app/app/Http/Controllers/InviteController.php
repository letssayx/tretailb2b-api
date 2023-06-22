<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App;
use App\Helper\ApiAuth;
use App\Invite;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Role;
use App\User;
use App\Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class InviteController extends Controller
{
    //

    public function invite(Request $request){
        try {
            DB::beginTransaction();
            $inputs = $request->only('email','permissions');
            $api_auth  = App::make(ApiAuth::class);
            $client_id = $request->cookie('defaultclient');
            $user = $api_auth->user();
            $inputs['created_by']   = $user->user_id;
            $inputs['client_id'] = $client_id;
            $validation=Validator::make($inputs,[
                'email'     => 'required',
                'created_by'   => 'required|exists:users,id' ,
                'client_id' => 'required|exists:clients,id'
             
            ]);
            if ($validation->fails()) {
               $errors = $validation->errors();
               $error_obj = array('status' => 'fail', 'message' => $validation->errors()->first());
               return response()->json($error_obj);
            }
            do {
                $token = Str::random(20);
            }
            while (Invite::where('token', $token)->first());
            $inputs['token'] = $token;
            $permissions=[];
            if(isset($inputs['permissions']['products'])){
                $permissions['products']      = $inputs['permissions']['products'];
                $permissions['brands']        = $inputs['permissions']['products'];
                $permissions['manufacturers'] = $inputs['permissions']['products'];
                $permissions['countries']     = $inputs['permissions']['products'];
                $permissions['categories']    = $inputs['permissions']['products'];
                $permissions['subcategories'] = $inputs['permissions']['products'];
                $permissions['items']         = $inputs['permissions']['products'];
                $permissions['bundles']       = $inputs['permissions']['products'];
                $permissions['transactions']  = $inputs['permissions']['products'];
                $permissions['analytics']     = $inputs['permissions']['products'];
                $permissions['wms']           = $inputs['permissions']['products'];
            }
            if(isset($inputs['permissions']['orders'])){
               $permissions['orders']    = $inputs['permissions']['orders'];
               $permissions['customers'] = $inputs['permissions']['orders'];
               $permissions['picklist']  = $inputs['permissions']['orders'];
               $permissions['channels']  = $inputs['permissions']['orders'];
               $permissions['returns']   = $inputs['permissions']['orders'];
               $permissions['new']       = $inputs['permissions']['orders'];
            }
            if( isset($inputs['permissions']['settings']) ){
              $permissions['settings']  = $inputs['permissions']['settings'];
              $permissions['tasks']     = $inputs['permissions']['settings']; 
              $permissions['logs']      = $inputs['permissions']['settings'];
              $permissions['teams']     = $inputs['permissions']['settings'];
            }
            $inputs['permissions'] = json_encode( $permissions);
            Invite::create( $inputs );
            DB::commit();
            return response()->json(['status'=>'success', 'message'=>'invite sent successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,500);
        }
    }

    public function accept(Request $request){
        try {
            DB::beginTransaction();
            $inputs = $request->all('password','confirm_password','token', 'name');
            $validation=Validator::make( $inputs ,[
                'name'               => 'required|min:3|max:50',
                'password'           => 'required|min:8|max:50',
                'confirm_password'   => 'required|same:password',
                'token'              => 'required|exists:invites,token',
            ]);

            if ($validation->fails()) {
               $errors    = $validation->errors();
               $error_obj = array('status' => 'fail', 'message' => $validation->errors()->first());
               return response()->json($error_obj);
            }
            $invite = Invite::where('token', $request->token)->first();
            $user = new User();
            $user->email    = $invite->email;
            $user->password = Hash::make( $inputs['password'] );
            $user->name     = $inputs['name'];
            $user->active   = true;
            $user->save();
            $role = new Role;
            $role->user_id   = $user->id;
            $role->client_id = $invite->client_id;
            $role->permissions = $invite->permissions;
            $role->save();
            $invite->delete();
            return response()->json(['status'=>'success', 'message'=>'team added successfully']);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,500);
        }

    }


}
