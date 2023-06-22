<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use GuzzleHttp\Client;

class AdminSettingsController extends Controller{

    private $quartz_host  = null;
    private $job_info_url = null;

    function __construct() {
        
        $this->interval_sync_set_job_url = env('AUTOMATE_JOB_HOST') . '/jobs/sync-interval-set-job';
        $this->job_info_url = env('AUTOMATE_JOB_HOST') . '/jobs/job-triggers';

    }

    public function GetSyncIntervalSetJob(){

        try {

            $http_client = new Client();
            $response = $http_client->request('POST', $this->job_info_url,[
                                'json' => [
                                    'job'       => 'sync_process_interval_set_job' ,
                                ]
                       ]);
            if( $response->getStatusCode() >= 200  && $response->getStatusCode() < 300) {
    
                return response()->json( json_decode($response->getBody(), true)[0] , 200);
    
            }else{
                
                throw new \Exception("API error");

            }

        } catch (\Exception $e) {
            
            $error_obj= array( 'status' => 'fail' , 'message' =>  $e->getMessage());
            return response()->json($error_obj, 400);

        }

    }

    public function SetSyncIntervalSetJob(Request $request){

        try {

            $http_client = new Client();
            $response = $http_client->request('POST', $this->interval_sync_set_job_url, [
                                'json' => [
                                    'start'    =>  true ,
                                    'interval' => $request->interval ,
                                     
                                ]
                       ]);
            if( $response->getStatusCode() >= 200  && $response->getStatusCode() < 300) {
    
                return response()->json( [ "status" => "success", "message" => "Successfully Job Interval Updated" ] , 200);
    
            }else{
                
                throw new \Exception("API error");

            }

        } catch (\Exception $e) {
            
            $error_obj= array( 'status' => 'fail' , 'message' =>  $e->getMessage());
            return response()->json($error_obj, 400);

        }


    }



}

