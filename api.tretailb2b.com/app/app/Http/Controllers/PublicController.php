<?php

namespace App\Http\Controllers;

use App\Request as SignupRequest;
use App\Verification; 
use App\User;
use App\Client as TretailClient;
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
use App\Helper\AmazonClient;
use Google\Cloud\Storage\StorageClient;
use Illuminate\Support\Facades\Mail;
use App\Mail\StoreSignup;
use App\Mail\UserSignup;
use App\Jobs\ProcessTest;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Stream\Stream;
use Orchestra\Parser\Xml\Facade as XmlParser;
use Illuminate\Support\Facades\Redirect;
use App\Jobs\ProcessSignup;


class PublicController extends Controller {
    
    /**
     * Signup request new client 
     *
     * @return \Illuminate\Http\JsonResponse
     */
    
     public function Signup(Request $request) {
        try {
            $input_array = $request->json()->all();
            $validation = Validator::make($input_array, [
                'official_name' => 'required|max:255|unique:clients,name',
                'name' => 'required',
                'email' => 'required|email|unique:users,email',
                'google_recaptcha_token' => 'required',
            ]);
            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => $errors);
                return response()->json($error_obj, 200);
            }

            //google captcha verification 
            $recaptcha_client = new Client();
            $recaptcha_response = $recaptcha_client->request('POST','https://www.google.com/recaptcha/api/siteverify',[
                'form_params' => [
                    'secret' => env('GOOGLE_RECAPTCHA_SECRET_KEY'),
                    'response' => $input_array['google_recaptcha_token']
                ]
            ]);
            $recaptcha_response_array=json_decode($recaptcha_response->getBody(),true);

           
            // if(!$recaptcha_response_array['success']) {
            //     $error_obj=array('status'=>'fail','message'=> 'Invalid request');
            //     return response()->json($error_obj,400);
            // } 
            // $recaptcha_client = new Client();

            // $recaptcha_response = $recaptcha_client->request('POST','https://www.google.com/recaptcha/api/siteverify',[
            //     'form_params' => [
            //         'secret' => env('GOOGLE_RECAPTCHA_SECRET_KEY'),
            //         'response' => $input_array['google_recaptcha_token']
            //     ]
            // ]);

            // Insert to request table 
            $email_validation_token=Str::random(30);
            $new_request= new SignupRequest;
            $new_request->official_name=$input_array['official_name'];
            // $new_request->official_address=$input_array['official_address'];
            // $new_request->official_phone=$input_array['official_phone'];
            // $new_request->official_email=$input_array['official_email'];
            $new_request->name=$input_array['name'];
            $new_request->email=$input_array['email'];
            // $new_request->password=Hash::make($input_array['password']);
            // $new_request->state=$input_array['state'];   
            // $new_request->gstin=$input_array['gstin'];
            $new_request->validation_token=$email_validation_token;
            $new_request->google_verification=json_encode($recaptcha_response_array,true);
            $new_request->save();
            
            // Send email for store signup verification 
            // $verification_link = env('STORE_SIGNUP_VERIFICATION_URL')."?token=".$email_validation_token;
            // Mail::to($input_array['email'])->send(new StoreSignup($verification_link));
            
            // Send email for user signup verification
            $verification_link = env('USER_SIGNUP_VERIFICATION_URL')."?token=".$email_validation_token;
            Mail::to($input_array['email'])->send(new UserSignup($verification_link,$input_array['official_name']));
            
            // Add request to verification table 
            $verification=new Verification;
            $verification->email=$input_array['email'];
            $verification->validation_token=$email_validation_token;
            $verification->type='SIGNUP'; // SIGNUP - User/Store signup with primary email verification
            $verification->valid_to=Carbon::now()->addDay(1); //24 hrs validity 
            $verification->reference=$new_request->id;
            $verification->save();

            ProcessSignup::dispatch($request->all());

            return response()->json(["status" => "success","message" => "Registered Successfully! Please check your registered Email to verify account."],200);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    /**
    * Verification
    *
    * @return \Illuminate\Http\JsonResponse
    */

    public function Verify(Request $request) {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'verification_token' => 'required',
            'google_recaptcha_token' => 'required',
            'password' => 'required',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'Validation Error: Password/Verification/Google Recaptcha Token is required.');
            return response()->json($error_obj, 405);
        }
        //google captcha verification 
        $recaptcha_client = new Client();
        $recaptcha_response = $recaptcha_client->request('POST','https://www.google.com/recaptcha/api/siteverify',[
            'form_params' => [
                'secret' => env('GOOGLE_RECAPTCHA_SECRET_KEY'),
                'response' => $input_array['google_recaptcha_token']
            ]
        ]);
        $recaptcha_response_array=json_decode($recaptcha_response->getBody(),true);
        //  if(!$recaptcha_response_array['success']) {
        //      $error_obj=array('status'=>'fail','message'=> 'Invalid request');
        //      return response()->json($error_obj,400);
        //  }  

        // Check valid token 
        $verification=Verification::where('validation_token',$input_array['verification_token'])->where('valid_to','>',Carbon::now())->where('status',false)->first();
        if(!$verification) {
            $error_obj=array('status'=>'fail','message'=> 'Invalid request on token');
            return response()->json($error_obj,400);
        }

        if($verification->type=='SIGNUP') {
            if(empty($verification->reference)) {
                $error_obj=array('status'=>'fail','message'=> 'Invalid request: Verification reference not found');
                return response()->json($error_obj,400);
            }
            $request=SignupRequest::find((int)$verification->reference);
            $request->password=Hash::make($input_array['password']);
            $request->email_verified_at=Carbon::now();
            $request->active=true;
            $request->save();

            $verification->status=true;
            $verification->verified_at=Carbon::now();
            $verification->save();

            $user=User::where('email',$verification->email)->first();
            if(!$user) {
                $error_obj=array('status'=>'fail','message'=> 'User not registered with us');
                return response()->json($error_obj,400);
            }
            $user->password=Hash::make($input_array['password']);
            $user->email_verified_at=Carbon::now();
            $user->active=true;
            $user->save();

            $client=TretailClient::where('email',$verification->email)->first();
            if(!$client) {
                $error_obj=array('status'=>'fail','message'=> 'Client not registered with us');
                return response()->json($error_obj,400);
            }
            $client->active=true;
            $client->save();
        } else if($verification->type=='NEW') {
            if(!isset($input_array['password']) || empty($input_array['password'])) {
                $error_obj=array('status'=>'fail','message'=> 'Password Missing');
                return response()->json($error_obj,400);
            }

            $user=User::where('email',$verification->email)->first();
            if(!$user) {
                $error_obj=array('status'=>'fail','message'=> 'User not registered with us');
                return response()->json($error_obj,400);
            }
            $user->password=Hash::make($input_array['password']);
            $user->email_verified_at=Carbon::now();
            $user->active=true;
            $user->save();

            $verification->status=true;
            $verification->verified_at=Carbon::now();
            $verification->save();
        } else {
            $error_obj=array('status'=>'fail','message'=> 'Unknown verification type');
            return response()->json($error_obj,400);
        }

        return response()->json(["status" => "success","message" => "Successfully Verified"],200);
    }

    public function AmazonCallback(Request $request) {
        if(isset($request->spapi_oauth_code) && isset($request->state) && isset($request->selling_partner_id)) {
            // return Redirect::to(env('APP_FRONTEND_URL')."/#/settings?spapi_oauth_code=".$request->spapi_oauth_code."&state=".$request->state."&selling_partner_id=".$request->selling_partner_id."&mws_auth_token=".$request->mws_auth_token."&channel=amazon");
            return Redirect::to(env('APP_FRONTEND_URL')."/#/settings?spapi_oauth_code=".$request->spapi_oauth_code."&state=".$request->state."&selling_partner_id=".$request->selling_partner_id."&channel=amazon");
        }
    }

    public function FlipkartCallback(Request $request) {
        if(isset($request->code) && isset($request->state)) {
            return Redirect::to(env('APP_FRONTEND_URL')."#/settings?flipkart_oauth_code=".$request->code."&state=".$request->state."&channel=flipkart");
        }
    }
}
