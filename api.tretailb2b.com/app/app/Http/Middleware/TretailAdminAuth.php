<?php

namespace App\Http\Middleware;

use Closure;
use \Firebase\JWT\JWT;
use App\Helper\ApiAuth;
use App;
use Illuminate\Support\Facades\Cookie;
use App\User;

class TretailAdminAuth
{
    
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        try {
            if ($request->hasHeader('x-access-token')) {
                $token = $request->header('x-access-token'); //Cookie::get(env('AUTH_COOKIE'));
                // $default_client = $request->header('x-default-client-id'); //Cookie::get(env('DEFAULT_CLIENT_COOKIE'));

                $is_allowed = false;
                
                if(!$token) {
                    $error_obj=array('status'=>'fail','message'=> '[TAA Error] Unauthorized Access: Missing Token.');
                    return response()->json($error_obj,401);
                }
                
                $decoded = JWT::decode($token, env('JWT_SECRET'), array('HS256'));
    /*
                if( $request->ip() != $decoded->aud ) {
                    $error_obj=array('status'=>'fail','message'=> '[TAA Error] Unauthorized Access: Client IP doesn\'t match.');
                    return response()->json($error_obj,401);
                }
    */
                if( !$decoded->is_admin ) {
                    $error_obj=array('status'=>'fail','message'=> '[TAA Error] Unauthorized for this route: No Admin access.');
                    return response()->json($error_obj,405);
                }

                // Get client db access 
                $user=User::find($decoded->subject);
                if($user) {
                    $api_auth=App::make(ApiAuth::class);
                    $api_auth->login(array(
                        'user_id' => $user->id,
                        'is_logged' => true,
                        'is_admin' => $user->is_admin,
                        'super_admin' => $user->super_admin,
                        'db_access' => null,
                        'client_details' => null,
                        'client_id' => null,
                    ));
                } else {
                    $error_obj=array('status'=>'fail','message'=> '[TAA Error] Unauthorized Access: User not found.' );
                    return response()->json($error_obj,401);
                }
            } else {
                $error_obj=array('status'=>'fail','message'=> '[TUA Error] Unauthorized Access: Invalid request structure.');
                return response()->json($error_obj,401);
            }
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,401);
        }
        return $next($request);
    }

    public function get_module($uri) 
    {
        $uri_arr=explode('/',$uri);
        if($uri_arr[1]) {
            return $uri_arr[1];
        }
        return null;
    }
}
