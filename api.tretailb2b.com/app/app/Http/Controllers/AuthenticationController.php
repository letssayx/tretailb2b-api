<?php

namespace App\Http\Controllers;

use App\User;
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


class AuthenticationController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            $input_array = $request->json()->all();
            $validation = Validator::make($input_array, [
                'email' => 'required',
                'password' => 'required'
            ]);
            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => $errors);
                return response()->json($error_obj, 401);
            }
            //\DB::enableQueryLog();
            $user = User::where('email', $input_array['email'])->where('active', 1)->first();
            //$query = \DB::getQueryLog();
            //print_r($query);
            if (!$user) {
                $error_obj = array('status' => 'fail', 'message' => 'Unauthorized: User not registered');
                return response()->json($error_obj, 401);
            }
            if (!Hash::check($input_array['password'], $user->password)) {
                $error_obj = array('status' => 'fail', 'message' => 'Unauthorized: Wrong Password');
                return response()->json($error_obj, 401);
            }

            $output_roles['stores'] = [];
            //$output_roles['others'] = [];
            $output_JWT_roles = "";
            // get roles 
            $default_client_id = "";
            $jwt_roles_array = [];
            foreach ($user->clients as $client) {
                if (empty($default_client_id)) {
                    $default_client_id = $client->id;
                }
                array_push($output_roles['stores'], array(
                    'client' => $client->name,
                    'id' => $client->id,
                    'is_admin' => $client->primary_user_id == $user->id ? 1 : 0,
                    'permissions' => json_decode($client->role->permissions,true)
                ));
                // array_push($output_JWT_roles, array(
                //     'subject' => $client->id,
                //     'permissions' => json_decode($client->role->permissions,true)
                // ));
                array_push($jwt_roles_array,"".$client->id.":".$client->role->id);
            }
            $output_JWT_roles = join(",",$jwt_roles_array);

            //push admin & superadmin role into others if any other 
            $output_roles['others']['is_admin']=$user->is_admin;
            $output_roles['others']['is_super']=$user->super_admin;

            $payload = array(
                "iss" => "https://tretailb2b.com",
                "aud" => $request->ip(),
                "iat" => Carbon::now()->timestamp,
                "nbf" => Carbon::now()->timestamp,
                "exp" => Carbon::now()->addDay(7)->timestamp,
                "is_admin" => $user->is_admin,
                'subject' => $user->id,
                'roles' => $output_JWT_roles
            );
            $jwt = JWT::encode($payload, env('JWT_SECRET'));
            // putenv("LOGGED_USER_NAME=$user->name");
            return response()->json([
                'status' => "success",
                'default_client_id' => $default_client_id,
                'access_token' => $jwt,
                'token_type' => 'session',
                'expires_in' => 7 * 24 * 3600,
                'output_roles' => $output_roles,
            ]);
        } catch(Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,401);
        }
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function info()
    {

        $api_auth = App::make(ApiAuth::class);
        return response()->json(['msg' => $api_auth->user()->db_access['name']]);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        try {
            $api_auth = App::make(ApiAuth::class);
            $api_auth->logout();
            return response()->json(['status' => 'success', 'message' => 'Logged out successfully']); //->Cookie(env('AUTH_COOKIE'), "", 1)->Cookie(env('DEFAULT_CLIENT_COOKIE'), "", 1);
        } catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        //return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'status' => "success",
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => 7 * 24 * 3600
        ]);
    }
}
