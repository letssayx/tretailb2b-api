<?php

namespace App\Http\Controllers\Store\Logs;

use App\User;
use App\Store\Log;
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
use Illuminate\Support\Facades\Storage;
use Google\Cloud\Storage\StorageClient;
use Enqueue\RdKafka\RdKafkaConnectionFactory;


class LogController extends Controller
{
    
    /**
     * Get  Brands.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function LogList(Request $request)
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
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
        $wms_inbound_logs = ['WMS_INVENTORY_ADD','WMS_INVENTORY_SUBTRACT','WMS_INVENTORY_QUERY','WMS_INVENTORY_TRANSACTIONS','WMS_INVENTORY_BIN_UPDATE'];
        $total_logs_count=0;
        $log=[];
        if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
            $log_query = Log::query();
            $total_logs_count_query = Log::select(DB::raw('count(*) as total_count'));

            if(isset($filter['q']) && !empty($filter['q']) ) {
                $log_query->where('name', 'like', '%'.$filter['q'].'%');
                $total_logs_count_query->where('name', 'like', '%'.$filter['q'].'%');
            }
            if(isset($filter['wms_inbound']) && !empty($filter['wms_inbound']) && $filter['wms_inbound'] == TRUE) {
                $log_query->whereIn('name', $wms_inbound_logs);
                $total_logs_count_query->whereIn('name', $wms_inbound_logs);
            }else{ 
                $log_query->whereNotIn('name', $wms_inbound_logs);
                $total_logs_count_query->whereNotIn('name', $wms_inbound_logs);
            }
            if(isset($filter['user_log'])&& !empty($filter['user_log']&& $filter['user_log'])==true){
                $log_query->where('user_log',true);
                $total_logs_count_query->where('user_log',true); 
            }else if(isset($filter['user_log'])&& !empty($filter['user_log']&& $filter['user_log'])==false){
                $log_query->where('user_log',false);
                $total_logs_count_query->where('user_log',false);
            }
            // else {
            //     $log_query = Log::orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
            //     $total_logs_count_query = Log::select(DB::raw('count(*) as total_count'))->first();
            // }
            $log = $log_query->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
            $total_logs_count = $total_logs_count_query->first();        
        }
        //$log=Log::latest()->get();
        $log_output=[];
        foreach($log as $l){
            array_push($log_output,array(
                'id' =>$l->id,
                'name' =>$l->name,
                'status' =>$l->status,
                'created_at' =>(string)Carbon::createFromFormat('Y-m-d H:i:s', $l->created_at),
            ));
        }
        return response()->json($log_output)->header('X-Total-Count', isset($total_logs_count->total_count) ? $total_logs_count->total_count : 0);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }

    /**
     * Create Log.
     *
     * @return \Illuminate\Http\JsonResponse
     */

    public function LogCreate(Request $request)
    {
        $api_auth = App::make(ApiAuth::class);
        // check additional data based on type
        $kafka_topics=json_decode(env('TOPIC_JSON'),true);
        $item=null;
        $topic='default';
        $is_validfile=false;
        $local_file_path=null;
        $gcp_file_name='';
        $folder_name=Str::random(15);
        // Authenticating with a keyfile path for google storage 
        $storage = new StorageClient([
            'keyFilePath' => env('GCP_STORAGE_KEY_FILE_PATH')
        ]);
        $bucket = $storage->bucket(env('GCP_LOGS_BUCKET'));
        try {
        //$input_array = $request->json()->all();
        $validation = Validator::make($request->all(), [
            'type' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'Validation error');
            return response()->json($error_obj, 400);
        }
        // $valid = Validator::make($request->all(), [
        //     'order_status' => 'required',
        //     'marketplace' => 'required'
        // ]);
        // if ($valid->fails()) {
        //     $errors = $valid->errors();
        //     $error_obj = array('status' => 'fail', 'message' => 'Fill the field');
        //     return response()->json($error_obj, 400);
        // }
        foreach($kafka_topics as $kafka_topic) {
            if($kafka_topic['item'] == $request->type) {
                $item=$kafka_topic['item'];
                $topic=$kafka_topic['topic'];
                if($kafka_topic['file']) {
                    $validation = Validator::make($request->all(), [
                        'file' => 'required|mimes:csv,txt|max:10204' // file allowed CSV & max size 10MB
                    ]);
                    if ($validation->fails()) {
                        $errors = $validation->errors();
                        $error_obj = array('status' => 'fail', 'message' => 'Validation error in file');
                        return response()->json($error_obj, 400);
                    }
                    $is_validfile=true;
                }
                break;
            }
        }
        if(!$item) {
            $error_obj = array('status' => 'fail', 'message' => 'Unknown operation');
            return response()->json($error_obj, 400);
        }

        if($request->has('force') && $request->force == true){

        }else{
          $last_item_log = Log::where('name',$item)->whereDate('created_at', '>', Carbon::yesterday()->format('Y-m-d'))->orderBy('id','DESC')->first();
          if($last_item_log!=null && strtolower($last_item_log->status)!='completed' && strtolower($last_item_log->status)!='failed'){
              $error_obj = array('status' => 'fail', 'message' => 'Previous operation is not completed');
              return response()->json($error_obj, 400);
          }
        }

        if($is_validfile && $local_file_path=$request->file('file')) {
            //Upload to GCP storage 
            $file_name=Str::random(10);
            $filename_array=explode('.',$local_file_path->getClientOriginalName());
            //$gcp_file_name = $file_name.'.'.$local_file_path->extension();
            if(strtolower($filename_array[1])!='csv') {
                // return error
                $error_obj = array('status' => 'fail', 'message' => 'Validation error in file. CSV file only');
                return response()->json($error_obj, 400);
            }
            $gcp_file_name = $file_name.'.'.$filename_array[1];
            $file_read = fopen($local_file_path->getPathName(), 'r');
            $object = $bucket->upload($file_read, [
                    'predefinedAcl' => 'projectPrivate',
                    'name' => $api_auth->user()->client_details['name'].'/'.env('GCP_STORAGE_OPERATION_LOG_FOLDER').'/'.$folder_name.'/'.$gcp_file_name
            ]);
            //print_r($object);
        }
        DB::beginTransaction();
        
        // add data 
        $log=new Log();
        $log->name=$item;
        $description=[];
        array_push($description,array('key'=>'event','value'=>'Task added in queue','time'=>(string)Carbon::createFromFormat('Y-m-d H:i:s', Carbon::now(), 'UTC')->setTimezone('asia/kolkata')));
        $log->user_log=true;
        $log->description=json_encode($description,true);
        $log->topic=$topic;
        if($is_validfile)
        {
            $input_files=[];
            array_push($input_files,array('uploaded_file_name'=>$local_file_path->getClientOriginalName(),'gcp_log_folder_name'=>env('GCP_STORAGE_OPERATION_LOG_FOLDER'),'gcp_task_folder_name'=>$folder_name,'gcp_file_name'=>$gcp_file_name));
            $log->input_files=json_encode($input_files,true);
        }
        $log->save();
        //print_r($api_auth->user()->client_details);
        // Prepare kafka message 
        $kafka_message= array('client_id'=>$api_auth->user()->client_id,'log_id'=>$log->id);


        if($request->has('start_date') && $request->has('end_date')){
            $kafka_message['start_date'] = $request->start_date;
            $kafka_message['end_date'] = $request->end_date;
        }
       
        if($log->name === 'PICKLIST_DOWNLOAD'){
            $kafka_message['pick_list_id'] = $request->id;
        }
        if($log->name == 'ORDER_DOWNLOAD'){
            $kafka_message['order_status'] = $request->status;
            $kafka_message['marketplace']  = $request->marketplace;
        }
        $kafka_message['force'] = $request->force;
        // send message to kafka cluster 
         /*  $connectionFactory = new RdKafkaConnectionFactory([ 
            'global' => [
                'group.id' => env('KAFKA_GROUP_ID'),
                'metadata.broker.list' => env('KAFKA_BROKER'),
                'enable.auto.commit' => 'true',
            ],
            'topic' => [
                'auto.offset.reset' => 'latest',
            ],
        ]);
        
        $context = $connectionFactory->createContext();
        $message = $context->createMessage(json_encode($kafka_message,true));
        $kafka_topic = $context->createTopic($topic);
        $context->createProducer()->send($kafka_topic, $message);
        */
        $kafka_producer = \Kafka::producer();
        $kafka_topic = $kafka_producer->newTopic($topic);
        $payload = json_encode([
           'body' => json_encode($kafka_message,true),
           'headers' => []
        ]);
        $kafka_topic->produce(RD_KAFKA_PARTITION_UA, 0, $payload);
        $kafka_producer->poll(0);

        for ($flushRetries = 0; $flushRetries < 10; $flushRetries++) {
            $result = $kafka_producer->flush(10000);
            if (RD_KAFKA_RESP_ERR_NO_ERROR === $result) {
               break;
            }
         }
         if (RD_KAFKA_RESP_ERR_NO_ERROR !== $result) {
            return response()->json(["status" => "fail","message" => "Failed to send kafka message","id" => $log->id],201);
         }
        // Commit Transaction
        DB::commit();
        return response()->json(["status" => "success","message" => "Successfully Log Created","id" => $log->id],201);
        //echo "done";
        }
    catch(\Exception $e) {
        // delete GCP storage if any error 
        $object = $bucket->object($api_auth->user()->client_details['name'].'/'.env('GCP_STORAGE_OPERATION_LOG_FOLDER').'/'.$folder_name.'/'.$gcp_file_name); // seems not working
        if ($object->exists()) {
            $object->delete();
        }
       
         // Rollback Transaction
        DB::rollback();
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Show Product.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function LogShow($id)
    {
        $api_auth = App::make(ApiAuth::class);
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $log=Log::find($id);
        $input_files_link=[];
        $output_files_link=[];
        // generate input & output files link 
        if($log) {
            // 
            $input_files_arr=json_decode($log->input_files,true);
            $output_files_arr=json_decode($log->output_files,true);
            $storage = new StorageClient([
                'keyFilePath' => env('GCP_STORAGE_KEY_FILE_PATH')
            ]);
            $bucket = $storage->bucket(env('GCP_LOGS_BUCKET'));
            if(!empty($input_files_arr)) {
                // generate input files link if exist 
                foreach($input_files_arr as $file) {
                    if(isset($file['gcp_file_name']) && !empty($file['gcp_file_name']) && isset($file['gcp_log_folder_name']) && !empty($file['gcp_log_folder_name']) && isset($file['gcp_task_folder_name']) && !empty($file['gcp_task_folder_name'])) {
                        $object = $bucket->object($api_auth->user()->client_details['name'].'/'.$file['gcp_log_folder_name'].'/'.$file['gcp_task_folder_name'].'/'.$file['gcp_file_name']);
                        $url = $object->signedUrl(
                        # This URL is valid for 15 minutes
                        new \DateTime('15 min'),
                        [
                            'version' => 'v4',
                        ]
                        );
                        array_push($input_files_link,array(
                            'name' => $file['gcp_file_name'],
                            'url' => $url
                        ));
                    }
                    
                }
            }
          

            // generate output files link if exist 
            if(!empty($output_files_arr)) {
                foreach($output_files_arr as $file) {
                    if(isset($file['gcp_file_name']) && !empty($file['gcp_file_name']) && isset($file['gcp_log_folder_name']) && !empty($file['gcp_log_folder_name']) && isset($file['gcp_task_folder_name']) && !empty($file['gcp_task_folder_name'])) {
                        $object = $bucket->object($api_auth->user()->client_details['name'].'/'.$file['gcp_log_folder_name'].'/'.$file['gcp_task_folder_name'].'/'.$file['gcp_file_name']);
                        $url = $object->signedUrl(
                        # This URL is valid for 15 minutes
                        new \DateTime('15 min'),
                        [
                            'version' => 'v4',
                        ]
                        );
                        array_push($output_files_link,array(
                            'name' => $file['gcp_file_name'],
                            'url' => $url
                        ));
                    }
                    
                }
            }
            

        }
        // $data = $log->status->orderBy($log->id, 'DESC')->first();
        return response()->json([
            'status' => "success",
            'id' => $log->id,
            'name' => $log->name,
            'queue_id' => $log->queue_id,
            'status' => $log->status,
            'created_at' => (string)Carbon::createFromFormat('Y-m-d H:i:s', $log->created_at),
            'updated_at' => (string)Carbon::createFromFormat('Y-m-d H:i:s', $log->updated_at),
            'description' => $log->description,
            'input_files' => $input_files_link,
            'output_files' => $output_files_link,
        ]);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Get  Brands.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function AdminLogList(Request $request)
    {
        try {
        //$api_auth = App::make(ApiAuth::class);
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
        $wms_inbound_logs = ['WMS_INVENTORY_ADD','WMS_INVENTORY_SUBTRACT','WMS_INVENTORY_QUERY','WMS_INVENTORY_TRANSACTIONS','WMS_INVENTORY_BIN_UPDATE'];
        $total_logs_count=0;
        $log=[];
        if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
            $log_query = Log::query();
            $total_logs_count_query = Log::query();
            // $total_logs_count_query = Log::select(DB::raw('count(*) as total_count'));

            if(isset($filter['q']) && !empty($filter['q']) ) {
                $log_query->where('name', 'like', '%'.$filter['q'].'%');
                $total_logs_count_query->where('name', 'like', '%'.$filter['q'].'%');
            }
            
            // $total_logs_count_query = Log::select(DB::raw('count(*) as total_count'))->first();

            $log = $log_query->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
            $total_logs_count = $total_logs_count_query->count();        
          }
        

            $log_output=[];
    
            foreach($log as $l){
                array_push($log_output, array(
                    'id' =>$l->id,
                    'name' =>$l->name,
                    'status' =>$l->status,
                    'created_at' => !empty($l->created_at)? (string)Carbon::createFromFormat('Y-m-d H:i:s', $l->created_at): null,
                ));
            }
            return response()->json($log_output)->header('X-Total-Count', isset($total_logs_count) ? $total_logs_count : 0);
        }
        catch(Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    public function AdminLogShow($id)
    {
        $api_auth = App::make(ApiAuth::class);
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $log=Log::find($id);
        if($log) {

         return response()->json([
            'status'      => "success",
            'id'          => $log->id,
            'name'        => $log->name,
            'queue_id'    => $log->queue_id,
            'status'      => $log->status,
            'created_at'  => !empty($log->created_at)? (string) Carbon::createFromFormat('Y-m-d H:i:s', $log->created_at): '',
            'updated_at'  => !empty($log->created_at)? (string)Carbon::createFromFormat('Y-m-d H:i:s', $log->updated_at): '',
            'description' => $log->description,
          ]);
        }
      }
      catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    public function CancelLog($id) {
        try{
            $log=Log::find($id);
            $log->status="cancelled";
            $log->save();
            $response=array('status'=>'success','message'=> 'Cancelled by user');
            return response()->json($response,200);
        } catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }
}
