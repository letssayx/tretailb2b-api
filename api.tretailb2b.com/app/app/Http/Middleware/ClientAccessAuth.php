<?php

namespace App\Http\Middleware;

use Closure;
use \Firebase\JWT\JWT;
use App\Helper\ApiAuth;
use App;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use App\User;
use App\Role;


class ClientAccessAuth
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
                $default_client = $request->header('x-default-client-id'); //Cookie::get(env('DEFAULT_CLIENT_COOKIE'));
                $is_allowed = false;

                if(!$token || !$default_client) {
                    $error_obj=array('status'=>'fail','message'=> '[CAA Error] Unauthorized Access: Missing Token/Client.');
                    return response()->json($error_obj,401);
                }
            
                $decoded = JWT::decode($token, env('JWT_SECRET'), array('HS256'));
/*                
                if( $request->ip() != $decoded->aud ) {
                    $error_obj=array('status'=>'fail','message'=> '[CAA Error] Unauthorized Access: Client IP doesn\'t match.');
                    return response()->json($error_obj,401);
                }
*/                
                //check Authorization for the route
                $decoded_roles = explode(",",$decoded->roles);
                foreach ($decoded_roles as $decoded_role) {
                    $client_id  = explode(":",$decoded_role)[0];
                    $role_id    = explode(":",$decoded_role)[1];
    
                    if( $default_client == $client_id ) {
                        $role = Role::find($role_id);
                        $permissions = json_decode($role->permissions);
                        foreach ($permissions as $key => $value) {
                            if($key == $this->get_module($request->route()->uri) && (in_array($value, $request->route()->methods) || ($value == "POST" && (in_array("GET", $request->route()->methods) || in_array("DELETE", $request->route()->methods) )))) {
                                $is_allowed=true;
                                break; 
                            }
                        }
                    }
                }
                if( !$is_allowed ) {
                    $error_obj=array('status'=>'fail','message'=> '[CAA Error] Unauthorized Access: No permission for this role.');
                    return response()->json($error_obj,405);
                }
                //get client db access 
                $user=User::find($decoded->subject);
                $client_details=$user->clients()->where('clients.id', $default_client)->first();
                $api_auth=App::make(ApiAuth::class);
                $api_auth->login(array(
                    'user_id' => $decoded->subject,
                    'is_logged' => true,
                    'is_admin' => $decoded->is_admin,
                    'super_admin' => null,
                    'db_access' => null,
                    'client_details' => array(
                        'name' => $client_details->name,
                        'state' => $client_details->state,
                        'gstin' => $client_details->gstin,
                        'owner' => false
                    ),
                    'client_id' => $default_client,
                ));
    
            } else {
                $error_obj=array('status'=>'fail','message'=> '[TUA Error] Unauthorized Access: Invalid request structure.');
                return response()->json($error_obj,401);
            }
        } catch(Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,401);
        }
        return $next($request);
    }

    public function get_module($uri) 
    {
        $uri_arr=explode('/',$uri);
        if($uri_arr[1]) {
            $sub_uri_arr=explode('-',$uri_arr[1]);
            if($sub_uri_arr[0]) {
                return $sub_uri_arr[0];
            }
            return $uri_arr[1];
        }
        
        return null;
    }
}
