<?php

namespace App\Http\Controllers;

use App\User;
use App\Client;
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
use App\ProfilePicture;


class UserSettingsController extends Controller
{
    
    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        try {
            $api_auth        = App::make(ApiAuth::class);
            $user            = User::find($api_auth->user()->user_id);
            $client          = Client::find($api_auth->user()->client_id);
            
            $user_picture    = ProfilePicture::find( $user->profile_picture_id);
            $client_picture  = ProfilePicture::find( $client->profile_picture_id);

            $data = [
                'user' => [
                    'name'            => $user->name ,
                    'email'           => $user->email ,
                    'profile_picture' => !empty($user_picture)?
                                         route('profile_picture', $user_picture->name):
                                         null,
                ],
                'client'=> [
                    'name'            => $client->name ,
                    'email'           => $client->email ,
                    'profile_picture' => !empty( $client_picture )?
                                         route('profile_picture', $client_picture->name):
                                         null,
                  ]
                ];

            return response()->json( $data );
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }

    /**
     * Update default store.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function UpdateDefaultStore(Request $request)
    {
        try {
        $api_auth = App::make(ApiAuth::class);
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'client_id' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors);
            return response()->json($error_obj, 405);
        }

        $user= User::find($api_auth->user()->user_id);
        $valid_change=false;
        foreach ($user->clients as $client) {
            if($client->id == $input_array['client_id']) {
                $valid_change=true;
                break;
            }
        }
        if(!$valid_change) {
            $error_obj=array('status'=>'fail','message'=> 'Invalid client id');
            return response()->json($error_obj,400);
        }
        
        return response()->json([
            'status' => "success",
            'default_client_id' => $input_array['client_id']
        ]);

        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }

    public function ClientInfo(){

        try {
            $data = [];
            $api_auth = App::make( ApiAuth::class );
            $user_details = $api_auth->user(); 
            
            $data['user'] =   User::select('name', 'email')
                              ->find( $user_details->user_id );
            $data['client'] = Client::select('name', 'address', 'phone', 'email')
                              ->find( $user_details->client_id );


            return response()->json( $data );
            
        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }

    public function ClientUpdate(Request $request){
        try {
            $data = [];
            $api_auth = App::make( ApiAuth::class );
            $user_details = $api_auth->user(); 

            $input_array = $request->json()->all();

            $validation = Validator::make($input_array, [
                'client_name'    =>   'required',
                'client_email'   =>   'required',
                'client_phone'   =>   'required',
                'client_address' =>   'required',
                'user_name'      =>   'required',
                'user_email'     =>   'required',
            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => $errors);
                return response()->json($error_obj, 405);
            }

            
            $user   =   User::find( $user_details->user_id );
            $client =   Client::find( $user_details->client_id );

            $user->name  = $request->user_name;
            $user->email = $request->user_email;

            $user->save();

            $client->name    = $request->client_name;
            $client->email   = $request->client_email;
            $client->address = $request->client_address;
            $client->phone   = $request->client_phone;

            $client->save();

            $success_obj = [
                'status'  => 'success',
                'message' => 'Successfully updated',
                'data'    => $input_array,
            ];
            return response()->json( $success_obj );
            
        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }

  
}
