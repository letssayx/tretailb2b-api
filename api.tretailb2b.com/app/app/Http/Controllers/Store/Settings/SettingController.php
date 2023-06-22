<?php

namespace App\Http\Controllers\Store\Settings;

use App\User;
use App\Store\Setting;
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
use GuzzleHttp\Client;
use GuzzleHttp\Psr7;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Stream\Stream;
use Orchestra\Parser\Xml\Facade as XmlParser;
use App\Helper\AmazonClient;
use Exception;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    
    /**
     * Get Settings.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SettingList()
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
        $settings=Setting::get();
        $output_settings=[];
        foreach($settings as $setting) {
            $output_settings=array_merge($output_settings, array(
                $setting['key'] =>  $setting['value']
            ));
        }

        // amazon auth 
        if(!isset($output_settings['amazon_verified']) || $output_settings['amazon_verified']=="0" || !isset($output_settings['amazon_sp_token_expired']) || $output_settings['amazon_sp_token_expired']=="1" || !isset($output_settings['amazon_auth_token'])) {
            // push amazon SP api auth url 
            $output_settings['amazon_sp_auth_url']= env('SP_AUTH_URL');
        }

        //flipkart auth
        if(!isset($output_settings['flipkart_verified']) || $output_settings['flipkart_verified']=="0" || !isset($output_settings['flipkart_token_expired']) || $output_settings['flipkart_token_expired']=="1") {
            // push amazon SP api auth url 
            $output_settings['flipkart_auth_url']= env('FLIPKART_AUTH_URL');
        }

        return response()->json($output_settings)->header('X-Total-Count', 2);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }


    /*
     * Create or update Setting.
     *
     * @return \Illuminate\Http\JsonResponse
     
    public function SettingCreate(Request $request)
    {
        try {
        $amazon_verified=false;
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'settings.amazon_seller_id' => 'required',
            'settings.amazon_marketplace_id' => 'required',
            'settings.amazon_auth_token' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'validation error');
            return response()->json($error_obj, 400);
        }
        // check amazon correct auth details added 
            try { 
                $amazon_client=new AmazonClient(env('AWS_DEVELOPER_ACCESSKEY_ID'),$input_array['settings']['amazon_seller_id'],$input_array['settings']['amazon_auth_token'],env('AWS_DEVELOPER_SECRETKEY_ID'));
    
                $outout_response=$amazon_client->invoke(array('Action'=> 'ListMarketplaceParticipations'),'2011-07-01','/Sellers/2011-07-01',true);
                $xml = XmlParser::extract($outout_response);
                $result = $xml->parse([
                                    'list' => ['uses' => 'ListMarketplaceParticipationsResult.ListParticipations.Participation[MarketplaceId,SellerId,HasSellerSuspendedListings]'],
                                    ]);
                //print_r($result);                    
               foreach($result['list'] as $seller) {
                if($seller['MarketplaceId'] == $input_array['settings']['amazon_marketplace_id']) {
                    // verified 
                    $amazon_verified=true;
                }
                break;
               }
               if($amazon_verified) {
                Setting::updateOrCreate(['key' => 'amazon_verified'] , ['value' => '1']);
               }
               else {
                Setting::updateOrCreate(['key' => 'amazon_verified'] , ['value' => '0']);
               }
            }
            catch(\Exception $e) {
                $error_obj=array('status'=>'fail','message'=> 'Amazon validation error');
                return response()->json($error_obj,200);
              }
        // add or update data 
        foreach ($input_array['settings'] as $key => $value) {
            Setting::updateOrCreate(['key' => $key] , ['value' => $value]);
        }
        
        return response()->json(["status" => "success","message" => "Successfully Settings Updated","amazon_verified" => $amazon_verified],200);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }
    */

    /**
     * Create or update Setting.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SettingCreate(Request $request)
    {
        try {
        $amazon_verified=false;
        $input_array = $request->json()->all();
        // $validation = Validator::make($input_array, [
        //     'settings.amazon_sp_integration' => 'required',
        // ]);
        // if ($validation->fails()) {
        //     $errors = $validation->errors();
        //     $error_obj = array('status' => 'fail', 'message' => 'validation error');
        //     return response()->json($error_obj, 400);
        // }
       
        // add or update data 
        foreach ($input_array['settings'] as $key => $value) {
            Setting::updateOrCreate(['key' => $key] , ['value' => $value]);
        }
        return response()->json(["status" => "success","message" => "Successfully Settings Updated"],200);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }
    
    /**
     * Amazon LWA exchange.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SettingUpdateAmazonToken(Request $request) 
    {
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'spapi_oauth_code' => 'required',
            'selling_partner_id' => 'required',
            // 'mws_auth_token' => 'required',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'validation error');
            return response()->json($error_obj, 400);
        }

        // Exchange token from amazon 
        $http_client = new Client();
        $response=$http_client->request('POST', env('SP_AUTH_TOKEN_URL'), [
            'form_params' => [
                'grant_type' => 'authorization_code',
                'code' => $input_array['spapi_oauth_code'],
                'redirect_uri' => env('SP_CALLBACK_URL'),
                'client_id' => env('SP_CLIENT_ID'),
                'client_secret' => env('SP_CLIENT_SECRET'),
            ]
        ]);
        if($response->getStatusCode()==200) {
            $response_data=$response->getBody();
            $response_injson=json_decode($response_data, true);
            Setting::updateOrCreate(['key' => 'sp_access_token'] , ['value' => $response_injson['access_token']]);
            Setting::updateOrCreate(['key' => 'sp_refresh_token'] , ['value' => $response_injson['refresh_token']]);
            Setting::updateOrCreate(['key' => 'amazon_seller_id'] , ['value' => $input_array['selling_partner_id']]);
            // Setting::updateOrCreate(['key' => 'amazon_auth_token'] , ['value' => $input_array['mws_auth_token']]);
            Setting::updateOrCreate(['key' => 'amazon_access_token_expire_in'] , ['value' => 3600]);
            Setting::updateOrCreate(['key' => 'amazon_integration'] , ['value' => '1']);
            Setting::updateOrCreate(['key' => 'amazon_verified'] , ['value' => '1']);
            Setting::updateOrCreate(['key' => 'amazon_sp_token_expired'] , ['value' => '0']);
            Setting::updateOrCreate(['key' => 'amazon_order_last_sync_time'] , ['value' => Carbon::now()->format("Y-m-d\TH:i:s.u")."000Z"]);
            Setting::where('key', 'amazon_access_token_creation_fail')->delete();
            return response()->json(["status" => "success","message" => "Successfully Integrated"],200);
        }
        else {
            $error_obj=array('status'=>'fail','message'=> "Error getting verification from Amazon");
            return response()->json($error_obj,400);
        }

    }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }
/**
     * Flipkart token exchange.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SettingUpdateFlipkartToken(Request $request) 
    {
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'flipkart_oauth_code' => 'required',
            'flipkart_state' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'validation error');
            return response()->json($error_obj, 400);
        }

        // Exchange token from Flipkart 
        $http_client = new Client();
        $response=$http_client->request('GET', env('FLIPKART_AUTH_TOKEN_URL').'&state='.$input_array['flipkart_state'].'&code='.$input_array['flipkart_oauth_code'], [
            'auth' => [env('FLIPKART_CLIENT_ID'), env('FLIPKART_CLIENT_SECRET')]
        ]);
        if($response->getStatusCode()==200) {
            $response_data=$response->getBody();
            $response_injson=json_decode($response_data, true);
            Setting::updateOrCreate(['key' => 'flipkart_access_token'] , ['value' => $response_injson['access_token']]);
            Setting::updateOrCreate(['key' => 'flipkart_refresh_token'] , ['value' => $response_injson['refresh_token']]);
            Setting::updateOrCreate(['key' => 'flipkart_access_token_expire_in'] , ['value' => $response_injson['expires_in']]);
            Setting::updateOrCreate(['key' => 'flipkart_integration'] , ['value' => '1']);
            Setting::updateOrCreate(['key' => 'flipkart_verified'] , ['value' => '1']);
            Setting::updateOrCreate(['key' => 'flipkart_token_expired'] , ['value' => '0']);
            Setting::updateOrCreate(['key' => 'flipkart_order_last_sync_time'] , ['value' => Carbon::now()->toISOString()]);
            Setting::updateOrCreate(['key' => 'flipkart_default_inventory_location_id'] , ['value' =>null]);
            Setting::where('key', 'flipkart_access_token_creation_fail')->delete();
            return response()->json(["status" => "success","message" => "Successfully Integrated"],200);
        }
        else {
            $error_obj=array('status'=>'fail','message'=> "Error getting verification from Flipkart");
            return response()->json($error_obj,400);
        }

    }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Amazon Disconnect integration.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function SettingOauthDisconnect(Request $request) 
    {
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'platform' => 'required',
            'delete' => 'required',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'validation error');
            return response()->json($error_obj, 400);
        }
        if(env('AUTOMATE_JOB_HOST')==null){
            throw new Exception("AUTOMATE_JOB_HOST key missing");
        }
        $api_auth=App::make(ApiAuth::class);
        $user = $api_auth->user();
        $http_client = new Client();
        $automate_job_host = env('AUTOMATE_JOB_HOST');
        $response = null;
        DB::beginTransaction();
        // check platform type & delete 
        if($input_array['platform']=="amazon" && $input_array['delete']) {
            Setting::where('key','sp_access_token')->delete();
            Setting::where('key','sp_refresh_token')->delete();
            Setting::where('key','amazon_seller_id')->delete();
            Setting::where('key','amazon_integration')->delete();
            Setting::where('key','amazon_verified')->delete();
            Setting::where('key','amazon_auth_token')->delete();
            Setting::where('key','amazon_sp_token_expired')->delete();
            Setting::where('key','amazon_order_last_sync_time')->delete();
            Setting::where('key','amazon_access_token_expire_in')->delete();
            Setting::where('key','amazon_flipkart_last_sync_time')->delete();
            $response=$http_client->request('POST',$automate_job_host.'/jobs/remove-sync', [
                'json' => [ 'client_id' => $user->client_id]
             ]);
            Setting::where('key','flipkart_order_sync_automation')->delete();
            Setting::where('key','amazon_flipkart_inventory_sync_automation')->delete();
            Setting::where('key','amazon_order_sync_automation')->delete();
            Setting::where('key', 'amazon_access_token_creation_fail')->delete();
        }

        // check platform type & delete 
        if($input_array['platform']=="flipkart" && $input_array['delete']) {
            Setting::where('key','flipkart_access_token')->delete();
            Setting::where('key','flipkart_refresh_token')->delete();
            Setting::where('key','flipkart_access_token_expire_in')->delete();
            Setting::where('key','flipkart_integration')->delete();
            Setting::where('key','flipkart_verified')->delete();
            Setting::where('key','flipkart_token_expired')->delete();
            Setting::where('key','flipkart_order_last_sync_time')->delete();
            Setting::where('key','flipkart_default_inventory_location_id')->delete();
            Setting::where('key','amazon_flipkart_last_sync_time')->delete();

            Setting::where('key','flipkart_order_sync_automation')->delete();
            Setting::where('key','amazon_flipkart_inventory_sync_automation')->delete();
            Setting::where('key','amazon_order_sync_automation')->delete();
            Setting::where('key', 'flipkart_access_token_creation_fail')->delete();
            
            $response=$http_client->request('POST',$automate_job_host.'/jobs/remove-sync', [
                'json' => [ 'client_id' => $user->client_id]
            ]);
        }
        if($response!=null && $response->getStatusCode()!=200){
            throw new Exception("Remove job sync failed");
        }
        DB::commit();
        return response()->json(["status" => "success","message" => "Successfully Settings Updated"]);
    }
    catch(\Exception $e) {
        DB::rollback();
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
    }
}

    /**
     * Automated Job Creation.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function AutomatedSyncJob(Request $request) 
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'method' => 'required',
            'inventory_sync' => 'required',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'validation error');
            return response()->json($error_obj, 400);
        }
        // check platform type & delete 
        if($input_array['method']=="update" && isset($input_array['inventory_sync'])) {
            $jobs_array=[];
            //$job_name = env('JOB_INVENTORY_SYNC_NAME')."-".$api_auth->user()->client_details['name']."-".$api_auth->user()->client_id;
            $job_name="test123";
                // set default to 10 min. If the job is not available it will create 
                array_push($jobs_array, array(
                    'job_name' => $job_name,
                    'job_type'=>env('JOB_INVENTORY_SYNC_NAME'),
                    'job_start' => $input_array['inventory_sync'] === true ? true : false,
                    'interval' => 10,
                    'interval_unit' => 'minute',
                    'runtime' => 'forever',
                    'start_at' => 'now'

                ));
                
                $http_client = new Client();
                $response=$http_client->request('POST',env('JOB_API_URL'), [
                    'json' => ['client_id' => 6,//$api_auth->user()->client_id,
                        'jobs' => $jobs_array
                     ]
                 ]);
                 if($response->getStatusCode()!=200) {
                     throw new \Exception("Job Microservice unavilable or invalid format");
                 }      
            }
        return response()->json(["status" => "success","message" => "Successfully Settings Updated"]);
    }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    public function AutomateJobUpdate(Request $request){
        try{

           if(env('AUTOMATE_JOBS')==null || env('AUTOMATE_JOB_HOST')==null){
               throw new Exception("AUTOMATE_JOBS or AUTOMATE_JOB_HOST not set");
           }
           $inputs=$request->only('jobs');
           $automate_jobs=json_decode(env('AUTOMATE_JOBS'));
           $automate_job_host=env('AUTOMATE_JOB_HOST');
           $job_urls=[];
           foreach($automate_jobs as $j){
               $job_urls[$j->name]=stripslashes($j->url);
               $setting_keys[$j->name]=stripslashes($j->key);
           }

           $validation=Validator::make($inputs,[
               'jobs.*.name'=>['required',Rule::in(array_keys($job_urls))],
               'jobs.*.start'=>'required|boolean'
           ]);
           $api_auth=App::make(ApiAuth::class);
           if($validation->fails()){
               $errors = $validation->errors();
               $error_obj = array('status' => 'fail', 'message' => 'validation error');
               return response()->json($error_obj, 400);
           }
           $user=$api_auth->user();
           $http_client = new Client();
           foreach($request->get('jobs') as $j){
                $req_url=$job_urls[$j['name']];
                $key_name=$setting_keys[$j['name']];
                $setting=Setting::where(["key"=>$key_name])->first();
                if($setting){
                    if(boolval($setting->value)==boolval($j['start']))
                    continue;
                }
                $response=$http_client->request('POST',$automate_job_host.$req_url, [
                    'json' => [
                        'id' => $user->client_id,
                        'start'=>boolval($j['start'])
                     ]
                 ]);
                if($response->getStatusCode()!=200) {
                    throw new \Exception($j['name'] ." automate job request failed");
                }else{
                    $resp=json_decode($response->getBody());
                    if($setting){
                        if(isset($resp->state)==false){
                            $setting->value="0";
                        }else{
                            if($resp->state=='restarted'||$resp->state=='started'){
                                $setting->value="1";
                            }else if($resp->state=="paused"){
                                $setting->value="0";
                            }
                        }
                        $setting->save();
                    }else{
                        $setting=new Setting;
                        $setting->key=$key_name;
                        if(isset($resp->state)==false){
                            $setting->value="0";
                        }else{
                          if($resp->state=='restarted'||$resp->state=='started'){
                              $setting->value="1";
                          }else if($resp->state=="paused"){
                              $setting->value="0";
                          }
                        }
                        $setting->save();
                    }

                }
                if(boolval($j['start'])==true){                         
                        switch ($j['name']) {
                            case "AMAZON_FLIPKART_INVENTORY_SYNC":
                                Setting::updateOrCreate(['key'=>'amazon_flipkart_last_sync_time'],['value'=>Carbon::now()]);
                                break;
                            case "AMAZON_ORDER_SYNC":
                                Setting::updateOrCreate(['key' => 'amazon_order_last_sync_time'] , ['value' => Carbon::now()->format("Y-m-d\TH:i:s.u")."000Z"]);
                                break;
                            case "FLIPKART_ORDER_SYNC":
                                Setting::updateOrCreate(['key' => 'flipkart_order_last_sync_time'] , ['value' => Carbon::now()->toISOString()]);
                                break;                               
                            default:
                                # code...
                                break;
                        }  
                }
           }
          
            return response()->json([
               "status" => "success",
               "message" => 'Settings saved successfully'
            ]);
        }catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }
    public function AutomateJobShow(){
        try{
            $automate_jobs=json_decode(env('AUTOMATE_JOBS'));
            $query=Setting::query();
            foreach($automate_jobs as $j){
                $query->orWhere('key',$j->key);
            }
            $setting_array = $query->get();
            $data=[];
            foreach($automate_jobs as $j){
                $found=false;
                foreach($setting_array as $setting){
                    if($setting->key==stripslashes($j->key)){
                        $data[$j->name]=boolval($setting->value);
                        $found=true;
                        break;
                    }
                }
                if(!$found)
                $data[$j->name]=false;
            }
            return response()->json($data);

        }catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }
}
