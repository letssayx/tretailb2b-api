<?php

namespace App\Http\Middleware;

use Closure;
use \Firebase\JWT\JWT;
use App\Helper\ApiAuth;
use App;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Cookie;
use App\User;

class TretailUserAuth {

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */

    public function handle(Request $request, Closure $next) {
        try {
            if ($request->hasHeader('x-access-token')) {
                $token = $request->header('x-access-token'); //Cookie::get(env('AUTH_COOKIE'));
                $default_client = $request->header('x-default-client-id'); //Cookie::get(env('DEFAULT_CLIENT_COOKIE'));
                $is_allowed = false;
                if(!$token || !$default_client) {
                    $error_obj=array('status'=>'fail','message'=> '[TUA Error] Unauthorized Access: Missing Token/Client.');
                    return response()->json($error_obj,401);
                }

                $decoded = JWT::decode($token, env('JWT_SECRET'), array('HS256'));
    /*            
                if( $request->ip() != $decoded->aud ) {
                    $error_obj=array('status'=>'fail','message'=> '[TUA Error] Unauthorized Access: Client IP doesn\'t match.');
                    return response()->json($error_obj,401);
                }
    */
                //get user specific details  
                $user=User::find($decoded->subject);
                $api_auth=App::make(ApiAuth::class);
                $api_auth->login(array(
                    'user_id' => $decoded->subject,
                    'is_logged' => true,
                    'is_admin' => $decoded->is_admin,
                    'super_admin' => null,
                    'db_access' => null,
                    'client_details' => null,
                    'client_id' => $default_client,
                ));
            } else {
                $error_obj=array('status'=>'fail','message'=> '[TUA Error] Unauthorized Access: Invalid request structure.');
                return response()->json($error_obj,401);
            }
        }
        catch(Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,401);
        }
        return $next($request);
    }

    public function get_module($uri) {
        $uri_arr=explode('/',$uri);
        if($uri_arr[1]) {
            return $uri_arr[1];
        }
        return null;
    }
}
