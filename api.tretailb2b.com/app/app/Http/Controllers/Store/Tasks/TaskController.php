<?php

namespace App\Http\Controllers\Store\Tasks;

use App\User;
use App\Store\Product;
use App\Store\Item;
use App\Client as SystemClient;
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
use App\Store\Brand;
use App\Store\Category;
use App\Store\Country;
use App\Store\Manufacturer;
use App\Store\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManagerStatic as Image;
use Google\Cloud\Storage\StorageClient;
use App\Jobs\ImportAmazonProduct;
use App\Jobs\ImportFlipkartProduct;
use Enqueue\RdKafka\RdKafkaConnectionFactory;


class TaskController extends Controller
{
    
    /**
     * Create task
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function TaskCreate(Request $request)
    {
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'task_code' => 'required'
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'validation error');
            return response()->json($error_obj, 400);
        }
        $api_auth = App::make(ApiAuth::class);
       

        // Judge Task code to do the operations then queue operations / function (now)
        
        switch ($input_array['task_code']) {
            case 1: 
                //set topic and opertion
                $topic = "gcp.store.products.amazon.import.0";
                $operation = "IMPORT_AMAZON_LISTING";
                // initial import of products & orders 
                // check if amazon verified to execute that 
                if(Setting::where('key','amazon_verified')->where('value','1')->first() && Setting::where('key','amazon_integration')->where('value','1')->first()) {
                    // function or task to call 
                    //echo time();
                    //$output = $this->ImportAmazonProducts(6);
                    //echo time();
                    //$this->ImportAmazonOrders();

                    // Check if the same task performated in last 6 hrs, if yes then deny 
                    $last_task=Log::where('task_code','1')->latest()->first();
                    if($last_task) {
                        $to = \Carbon\Carbon::createFromFormat('Y-m-d H:s:i', Carbon::now());
                        $from = \Carbon\Carbon::createFromFormat('Y-m-d H:s:i', $last_task->created_at);
                        $diff_in_minutes = $to->diffInMinutes($from);
                        if($diff_in_minutes<10) { // alter that time on demand
                            $error_obj=array('status'=>'fail','message'=> 'Too Frequent to execute. Please try later');
                            return response()->json($error_obj,200);
                        }
                        if(strtolower($last_task->status)!="completed" && strtolower($last_task->status)!="failed" && $diff_in_minutes<2880){
                            $error_obj=array('status'=>'fail','message'=> 'Previous operation is not completed');
                            return response()->json($error_obj,200);

                        }
                    }
                    // generate queue id ref
                    $queue_id=time();
                    //ImportAmazonProduct::dispatch($api_auth->user()->client_id,$input_array['task_code'],$queue_id)->delay(now()->addMinutes(1));
                    $log= new Log;
                    $log->name=$operation;
                    $log->queue_id=$queue_id;
                    $log->task_code=$input_array['task_code'];
                    $log->user_log = true;
                    $description=[];
                    array_push($description,array('key'=>'event','value'=>'Task added in queue','time'=>(string)Carbon::now('asia/kolkata')->format("Y-m-d H:i:s")));
                    $log->description=json_encode($description,true);
                    $log->save();
                    $kafka_message= array('client_id'=>$api_auth->user()->client_id,'log_id'=>$log->id);
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
                         throw new Exception("Failed to send kafka message");
                     }

                }
                else {
                    $error_obj=array('status'=>'fail','message'=> 'Amazon account is not verified or not enabled');
                    return response()->json($error_obj,200);
                }
                break;
            case 2:
            //echo "Your favorite color is blue!";
            ImportFlipkartProduct::dispatch($api_auth->user()->client_id,$input_array['task_code'],1);
            break;
            case 3:
            //echo "Your favorite color is green!";
            break;
            default:
            return response()->json(["status" => "success","message" => "No task to process"],200);
        }
        
        return response()->json(["status" => "success","message" => 'Operation Queued'],200);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    public function ImportAmazonProducts($client_id) {
        // Get client amazon DB credientials by client id 
        DB::purge(env('DB_CONNECTION', 'mysql')); 
        \Config::set('database.connections.mysql', array(
            'driver'    => env("DB_CONNECTION", "mysql"),
            'host'      => env("DB_HOST", "127.0.0.1"),
            'database'  => env("DB_DATABASE", "db_tretail_api_master"),
            'username'  => env("DB_USERNAME", "root"),
            'password'  => env("DB_PASSWORD", "password"),
            'port'      => env("DB_PORT", "3306"),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
        ));
        DB::reconnect(env('DB_CONNECTION', 'mysql'));
        $client_details=SystemClient::find($client_id);
        // Change client crds 
        DB::purge(env('DB_CONNECTION', 'mysql')); 
        \Config::set('database.connections.mysql', array(
            'driver'    => env('DB_CONNECTION', 'mysql'),
            'host'      => $client_details->db_host,
            'database'  => $client_details->db_name,
            'username'  => $client_details->db_user,
            'password'  => $client_details->db_pass,
            'port'      => $client_details->db_port,
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
        ));

        DB::reconnect(env('DB_CONNECTION', 'mysql'));
        //get amazon crds 
        $settings=Setting::get();
        $output_settings=[];
        foreach($settings as $setting) {
            $output_settings=array_merge($output_settings, array(
                $setting['key'] =>  $setting['value']
            ));
        }
        if(!empty($output_settings['amazon_seller_id']) && !empty($output_settings['amazon_marketplace_id']) && !empty($output_settings['amazon_auth_token']) && $output_settings['amazon_verified']=='1' && $output_settings['amazon_integration']=='1' ) {
            // Request amazon API to prepare product listing 
            $amazon_client=new AmazonClient(env('AWS_DEVELOPER_ACCESSKEY_ID'),$output_settings['amazon_seller_id'],$output_settings['amazon_auth_token'],env('AWS_DEVELOPER_SECRETKEY_ID'));
            $request_report_response=$amazon_client->invoke(array('Action'=> 'RequestReport','ReportType' => '_GET_MERCHANT_LISTINGS_ALL_DATA_','MarketplaceIdList.Id.1'=> $output_settings['amazon_marketplace_id']),'2009-01-01','/',false);
            $request_report_response_xml = XmlParser::extract($request_report_response);
            $request_report_response_result = $request_report_response_xml->parse([
                                    'list' => ['uses' => 'RequestReportResult.ReportRequestInfo[ReportProcessingStatus,ReportRequestId]'],
                                    ]);
            $ReportRequestId=$request_report_response_result['list'][0]['ReportRequestId'];   
            $request_id=0;                   
            for($i=1;$i<=15;$i++) {
                //echo $i;
                sleep($i*10);
                $request_id=$this->CheckAmazonRequestProcessing($amazon_client,$ReportRequestId);
                if($request_id) {
                    break;
                }
            }
            if(!$request_id) {
                throw new \Exception('Unable to complete amazon request process');
            }
            // call report API to get the actual report
            $report_response=$amazon_client->invoke(array('Action'=> 'GetReport','ReportId' => $request_id),'2009-01-01','/',false);

                       
            $products_array=explode(PHP_EOL,$report_response);
            //print_r($products_array);
            //Filter to check new SKU only 
            // foreach($products_array as $product) {

            // }
            $count=1;
            
            // Create Uncategorised brand / categories / sub categories 
            $brand='Uncategorised';
            $manufacturer='Uncategorised';
            $category='Uncategorised';
            $country='India';
            Brand::firstOrCreate(
                ['name' => $brand]);
            Manufacturer::firstOrCreate(
                ['name' => $manufacturer]);
            $default_category=Category::firstOrCreate(
                ['name' => $category]);
            $default_country=Country::firstOrCreate(
                ['name' => $country]);   
                
             // Authenticating with a keyfile path for google storage (for products images)
            $storage = new StorageClient([
                'keyFilePath' => env('GCP_STORAGE_KEY_FILE_PATH')
             ]);
            $bucket = $storage->bucket(env('GCP_PRODUCTS_BUCKET'));    

            while(1) {
                // exit if get blank line 
                if(empty($products_array[$count])) {
                break;
                }
                //Process 10 listing at a time 
                if(count($products_array)>$count) {
                    $data=[];
                    $product_chunk=[];
                    $j=0; // actual loop through
                    $k=0; // inner loop, number ASIN need to process
                    while(1) {
                        if(isset($products_array[$count+$j]) && !empty($products_array[$count+$j])) {
                            $product_tmp=explode("\t",$products_array[$count+$j]);
                            $item=Item::where('sku',$product_tmp[3])->first();
                            if(!$item) {
                                $product=Product::where('sku',$product_tmp[3])->first();
                                if(!$product) {
                                    $product_chunk[$k]=$product_tmp;
                                    $data['ASINList.ASIN.'.($k+1)]= $product_chunk[$k][16];
                                    if($k>=9) {
                                        break;
                                    }
                                    $k++;
                                }
                            }
                            
                        }
                        if(($count+$j)> count($products_array)) {
                        break;
                        }
                        $j++;
                    }
                    if(empty($product_chunk)) {
                    break;
                    }
                    //call product api to get more details
                    $data['Action']= 'GetMatchingProduct';
                    $data['MarketplaceId']= $output_settings['amazon_marketplace_id'];
                    
                    $product_response='';
                    for($i=1;$i<=10;$i++) {
                        try {
                            //echo "Test :" . $i;
                            //print_r($data);
                            $product_response=$amazon_client->invoke($data,'2011-10-01','/Products/2011-10-01',true);
                            break;
                        }
                        catch(\Exception $e) {
                            //print_r($e->getResponse()->getBody()->getContents());
                            if($i<10) {
                                sleep($i*10);
                                continue;
                            }
                            else {
                                throw new \Exception('Product service unavailable from long time');
                            }
                           
 
                        }
                        
                    }
                    
                    $product_response=str_replace("ns2:","",$product_response); 
                    $product_response_xml = simplexml_load_string($product_response);
                   
                    $i=0;  
                    foreach($product_response_xml->GetMatchingProductResult as $product) {
                        // Create / Set brand & manufacturer 
                        $brand='Uncategorised';
                        $manufacturer='Uncategorised';
                        $subcategory_name='Uncategorised';
                        $subcategory_amazon_node_id='';
                        $subcategory_amazon_node_name='';
                        $country='India';
                        
                        //echo "-mark0";

                        if($product->Product->AttributeSets->ItemAttributes->Brand) {
                            $brand=(string)$product->Product->AttributeSets->ItemAttributes->Brand;
                           
                        }
                        if($product->Product->AttributeSets->ItemAttributes->Manufacturer) {
                            $manufacturer=(string)$product->Product->AttributeSets->ItemAttributes->Manufacturer;
                        }

                        if($product->Product->AttributeSets->ItemAttributes->ProductTypeName) {
                            $subcategory_name=(string)$product->Product->AttributeSets->ItemAttributes->ProductTypeName;
                        }
                        // if($product->Product->SalesRankings->SalesRank[0]->ProductCategoryId) {
                        //     $subcategory_amazon_node_name=(string)$product->Product->SalesRankings->SalesRank[0]->ProductCategoryId;
                        // }
                        if($product->Product->SalesRankings->SalesRank) {
                            $subcategory_amazon_node_id=(string)$product->Product->SalesRankings->SalesRank[1]->ProductCategoryId;
                        }
                        //echo "mark0.".$subcategory_name."--";
                        $brand=Brand::firstOrCreate(
                            ['name' => $brand]);
                        
                         $manufacturer=Manufacturer::firstOrCreate(
                            ['name' => $manufacturer]);

                        
                        $subcategory=Category::where('name',$subcategory_name)->first();
                        if(!$subcategory) {
                            $subcategory=Category::create(['name' => $subcategory_name,'parent_category_id' => $default_category->id, 'amazon_field_mapping' => $subcategory_amazon_node_id]); 
                        }
                        else {
                            if(!empty($subcategory_amazon_node_id) && empty($subcategory->amazon_field_mapping)) {
                                $subcategory->amazon_field_mapping=$subcategory_amazon_node_id;
                                $subcategory->parent_category_id = $default_category->id;
                                $subcategory->save();
                            }
                        }
                        
   
                        if($product->Product->Relationships->VariationParent) {
                            //echo "Child listing";
                            $product_chunk[$i][30]='item'; // Listing Type
                            $product_chunk[$i][31]=(string)$product->Product->Relationships->VariationParent->Identifiers->MarketplaceASIN->ASIN; // Parent ASIN   
                            $product_chunk[$i][32]=$brand->id; // Brand
                            $product_chunk[$i][33]=$default_category->id; // Category 
                            $product_chunk[$i][34]=$subcategory->id; // Sub category
                            $product_chunk[$i][35]=(string)$product->Product->AttributeSets->ItemAttributes->SmallImage->URL; // Main Image 
                            $product_chunk[$i][36]=(string)$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Length."*".(string)$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Width."*".$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Height; // L X B X H
                            $product_chunk[$i][37]=$this->xml_attribute($product->Product->AttributeSets->ItemAttributes->ItemDimensions->Length,'Units'); // Diamention Unit
                            $product_chunk[$i][38]=(string)$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Weight; // Weight 
                            $product_chunk[$i][39]=$this->xml_attribute($product->Product->AttributeSets->ItemAttributes->ItemDimensions->Weight,'Units'); // Weight Unit 
                            $variants=[];
                            if($product->Product->AttributeSets->ItemAttributes->Color) {
                                array_push($variants,array('key'=>'color','value'=>(string)$product->Product->AttributeSets->ItemAttributes->Color));
                            }
                            if($product->Product->AttributeSets->ItemAttributes->Size) {
                                array_push($variants,array('key'=>'size','value'=>(string)$product->Product->AttributeSets->ItemAttributes->Size));
                            }
                            $product_chunk[$i][40]= json_encode($variants,true); // child sku variants 
                            $product_chunk[$i][41]=$manufacturer->id; // manufacturer 
                            $product_chunk[$i][42]=$default_country->id; // Country of Origin 

                            

                        }
                        else if($product->Product->Relationships->VariationChild) {
                             // echo "Parent Listing";
                             $product_chunk[$i][30]='product';
                             $product_chunk[$i][31]=''; // Parent ASIN if any 
                             $product_chunk[$i][32]=$brand->id; // Brand
                             $product_chunk[$i][33]=$default_category->id; // Category 
                             $product_chunk[$i][34]=$subcategory->id; // Sub category  
                             $product_chunk[$i][35]=(string)$product->Product->AttributeSets->ItemAttributes->SmallImage->URL; // Main Image 
                             $product_chunk[$i][36]=$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Length."*".$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Width."*".$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Height; // L X B X H
                             $product_chunk[$i][37]=$this->xml_attribute($product->Product->AttributeSets->ItemAttributes->ItemDimensions->Length,'Units'); // Diamention Unit
                             $product_chunk[$i][38]=(string)$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Weight; // Weight 
                             $product_chunk[$i][39]=$this->xml_attribute($product->Product->AttributeSets->ItemAttributes->ItemDimensions->Weight,'Units'); // Weight Unit 
                             $product_chunk[$i][40]= ''; // child sku variants 
                             $product_chunk[$i][41]=$manufacturer->id; // manufacturer 
                             $product_chunk[$i][42]=$default_country->id; // Country of Origin 
                             
                        }
                        else {
                                
                             $product_chunk[$i][30]='single'; // same parent & same child 
                             $product_chunk[$i][31]=''; // Parent ASIN if any 
                             $product_chunk[$i][32]=$brand->id; // Brand
                             $product_chunk[$i][33]=$default_category->id; // Category 
                             $product_chunk[$i][34]=$subcategory->id; // Sub category  
                             $product_chunk[$i][35]=(string)$product->Product->AttributeSets->ItemAttributes->SmallImage->URL; // Main Image 
                             $product_chunk[$i][36]=$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Length."*".$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Width."*".$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Height; // L X B X H
                             $product_chunk[$i][37]=$this->xml_attribute($product->Product->AttributeSets->ItemAttributes->ItemDimensions->Length,'Units'); // Diamention Unit
                             $product_chunk[$i][38]=(string)$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Weight; // Weight 
                             $product_chunk[$i][39]=$this->xml_attribute($product->Product->AttributeSets->ItemAttributes->ItemDimensions->Weight,'Units'); // Weight Unit 
                             $product_chunk[$i][40]= ''; // child sku variants 
                             $product_chunk[$i][41]=$manufacturer->id; // manufacturer 
                             $product_chunk[$i][42]=$default_country->id; // Country of Origin 
                        } 
                        $i++;
                    }
                    //print_r($product_chunk);
                    // Add / Update to DB 
                    foreach ($product_chunk as $product) {
                            $product_launch_date=date('Y-m-d');
                            $product_launch_date_time_arr=explode(' ', $product[6]);
                            if($product_launch_date_time_arr[0]) {
                                $product_launch_date=$product_launch_date_time_arr[0];
                            }
                            //echo "mark2";
                            if($product[30]=='product') {
                                //add or update product
                                $product_add_update=Product::where('asin',$product[16])->first();
                                if(!$product_add_update) {
                                    $product_add_update= new Product;
                                }
                                $product_add_update->sku=$product[3];
                                $product_add_update->name=addslashes($product[0]);
                                $product_add_update->description=addslashes($product[1]);
                                $product_add_update->brand_id=$product[32];
                                $product_add_update->category_id=$product[34];
                                $product_add_update->launch_date=$product_launch_date;
                                $product_add_update->asin=$product[16];
                                //$product_add_update->asin=$product[16];
                                $product_add_update->country_id=$product[42];
                                $product_add_update->amazon_listing_id=$product[2];
                                $product_add_update->manufacturer_id=$product[41];
                                // for images 
                                
                                if(!empty($product[35])) {
                                    if(!empty($product_add_update->pictures)) {
                                        $pictures=json_decode($product_add_update->pictures,true);
                                        // Delete folder from google storage if exist
                                        if(isset($pictures['client']) && !empty($pictures['client'])) {
                                            $object = $bucket->object($pictures['client'].'/'.$pictures['folder'].'/'); // Need to deelete for update 
                                            if ($object->exists()) {
                                                $object->delete();
                                            }
                                        } 
                                    }
                                        $folder_name=Str::random(15);
                                        $pictures=[];
                                        $pictures['bucket']=env('GCP_PRODUCTS_BUCKET');
                                        $pictures['client']=$client_details->name;
                                        $pictures['folder']=$folder_name;
                                        $pictures['images']=[];
                                       
                                        Storage::disk('local')->makeDirectory($folder_name);
                                        $path = Storage::path($folder_name);
                                        $img_aws_url_arr=explode('_',$product[35]);
                                        if(count($img_aws_url_arr)==3) {
                                            $large_aws_image_url=$img_aws_url_arr[0].'__'.$img_aws_url_arr[2];
                                            //download large image from url 
                                            $file_name=Str::random(10);
                                            $imageName = $file_name.$img_aws_url_arr[2];
                                            $imageName_thumbnail= $file_name.'-thumbnail'.$img_aws_url_arr[2];
                                            $imageName_general= $file_name.'-general'.$img_aws_url_arr[2];
                                            if(file_put_contents( $path.'/'.$imageName,file_get_contents($large_aws_image_url))) { 
                                                //echo "File downloaded successfully"; 
                                                $path = Storage::path($folder_name.'/'.$imageName);
                                                $image_resize = Image::make($path);  
                                                $image_resize->resize(210, 280); // 3:4 for General  
                                                $image_resize->save(storage_path().'//app/'.$folder_name.'/'.$imageName_general);         
                                                $image_resize->resize(75, 100); // 3:4 for thumbnail 
                                                $image_resize->save(storage_path().'//app/'.$folder_name.'/'.$imageName_thumbnail);
                                                //upload to gcp storage
                                                $file_read = fopen($path, 'r');
                                                $object = $bucket->upload($file_read, [
                                                    'predefinedAcl' => 'publicRead',
                                                    'name' => $pictures['client'].'/'.$folder_name.'/'.$imageName
                                                ]);
                                                $file_read = fopen(storage_path().'//app/'.$folder_name.'/'.$imageName_general, 'r');
                                                $object = $bucket->upload($file_read, [
                                                    'predefinedAcl' => 'publicRead',
                                                    'name' => $pictures['client'].'/'.$folder_name.'/'.$imageName_general
                                                ]);
                                                $file_read = fopen(storage_path().'//app/'.$folder_name.'/'.$imageName_thumbnail, 'r');
                                                $object = $bucket->upload($file_read, [
                                                    'predefinedAcl' => 'publicRead',
                                                    'name' => $pictures['client'].'/'.$folder_name.'/'.$imageName_thumbnail
                                                ]);
                                                array_push($pictures['images'],array(
                                                    'actual_image_name' => $imageName,
                                                    'general_image_name' => $imageName_general,
                                                    'thumbnail_image_name' => $imageName_thumbnail,
                                                ));
                                                $product_add_update->pictures=json_encode($pictures);
                                            } 
                                            else { 
                                                //echo "File downloading failed."; 
                                            } 
                                        }
                                        
                                          // delete local folder created for images 
                                        Storage::deleteDirectory($folder_name);
                                }
                                
                                $product_add_update->save();
                            }
                            else if($product[30]=='item') {
                                $parent_product=Product::where('asin',$product[31])->first();
                                if(!$parent_product) {
                                    $parent_product= new Product;
                                    $parent_product->sku=$product[31];
                                    $parent_product->name=addslashes($product[0]);
                                    $parent_product->description=addslashes($product[1]);
                                    $parent_product->brand_id=$product[32];
                                    $parent_product->category_id=$product[34]; // need to add uncategorised 
                                    $parent_product->launch_date=$product_launch_date;
                                    $parent_product->asin=$product[31];
                                    $parent_product->country_id=$product[42];
                                    $parent_product->amazon_listing_id=$product[2];
                                    $parent_product->manufacturer_id=$product[41];
                                    $parent_product->save();
                                }
                                //echo "mark3";
                                //add or update item 
                                $item_add_update=Item::where('sku' ,$product[3])->first();
                                if(!$item_add_update) {
                                    $item_add_update= new Item;
                                    $item_add_update->sku=$product[3];
                                }
                                $item_add_update->product_id=$parent_product->id;
                                $item_add_update->mrp=$product[29];
                                $item_add_update->price=$product[4];
                                $item_add_update->dimentions=$product[36];
                                $item_add_update->weight=$product[38];
                                $item_add_update->quantity=$product[5];
                                $item_add_update->variants=empty($product[40])? NULL : $product[40];
                                //$item_add_update->attributes=$product[42];
                                $item_add_update->active=$product[28]==='Active'? true: false;
                                $item_add_update->dimension_unit=empty($product[37]) ? 'inches':$product[37];
                                $item_add_update->weight_unit=empty($product[39]) ? 'pounds' : $product[39];
                                $item_add_update->sync_amazon=true;
                                $item_add_update->asin=$product[31];
                                $item_add_update->amazon_listing_id=$product[2];
                                $item_add_update->save();

                            }
                            else {
                                $parent_product=Product::where('asin',$product[31])->first();
                                if(!$parent_product) {
                                    $parent_product= new Product;
                                    $parent_product->sku=$product[3];
                                    $parent_product->name=addslashes($product[0]);
                                    $parent_product->description=addslashes($product[1]);
                                    $parent_product->brand_id=$product[32];
                                    $parent_product->category_id=$product[34]; // need to add uncategorised 
                                    $parent_product->launch_date=$product_launch_date;
                                    $parent_product->asin=$product[31];
                                    $parent_product->country_id=$product[42];
                                    $parent_product->amazon_listing_id=$product[2];
                                    $parent_product->manufacturer_id=$product[41];
                                    if(!empty($product[35])) {
                                            $folder_name=Str::random(15);
                                            $pictures=[];
                                            $pictures['bucket']=env('GCP_PRODUCTS_BUCKET');
                                            $pictures['client']=$client_details->name;
                                            $pictures['folder']=$folder_name;
                                            $pictures['images']=[];
                                           
                                            Storage::disk('local')->makeDirectory($folder_name);
                                            $path = Storage::path($folder_name);
                                            $img_aws_url_arr=explode('_',$product[35]);
                                            if(count($img_aws_url_arr)==3) {
                                                $large_aws_image_url=$img_aws_url_arr[0].'__'.$img_aws_url_arr[2];
                                                //download large image from url 
                                                $file_name=Str::random(10);
                                                $imageName = $file_name.$img_aws_url_arr[2];
                                                $imageName_thumbnail= $file_name.'-thumbnail'.$img_aws_url_arr[2];
                                                $imageName_general= $file_name.'-general'.$img_aws_url_arr[2];
                                                if(file_put_contents( $path.'/'.$imageName,file_get_contents($large_aws_image_url))) { 
                                                    //echo "File downloaded successfully"; 
                                                    $path = Storage::path($folder_name.'/'.$imageName);
                                                    $image_resize = Image::make($path);  
                                                    $image_resize->resize(210, 280); // 3:4 for General  
                                                    $image_resize->save(storage_path().'//app/'.$folder_name.'/'.$imageName_general);         
                                                    $image_resize->resize(75, 100); // 3:4 for thumbnail 
                                                    $image_resize->save(storage_path().'//app/'.$folder_name.'/'.$imageName_thumbnail);
                                                    //upload to gcp storage
                                                    $file_read = fopen($path, 'r');
                                                    $object = $bucket->upload($file_read, [
                                                        'predefinedAcl' => 'publicRead',
                                                        'name' => $pictures['client'].'/'.$folder_name.'/'.$imageName
                                                    ]);
                                                    $file_read = fopen(storage_path().'//app/'.$folder_name.'/'.$imageName_general, 'r');
                                                    $object = $bucket->upload($file_read, [
                                                        'predefinedAcl' => 'publicRead',
                                                        'name' => $pictures['client'].'/'.$folder_name.'/'.$imageName_general
                                                    ]);
                                                    $file_read = fopen(storage_path().'//app/'.$folder_name.'/'.$imageName_thumbnail, 'r');
                                                    $object = $bucket->upload($file_read, [
                                                        'predefinedAcl' => 'publicRead',
                                                        'name' => $pictures['client'].'/'.$folder_name.'/'.$imageName_thumbnail
                                                    ]);
                                                    array_push($pictures['images'],array(
                                                        'actual_image_name' => $imageName,
                                                        'general_image_name' => $imageName_general,
                                                        'thumbnail_image_name' => $imageName_thumbnail,
                                                    ));
                                                    $parent_product->pictures=json_encode($pictures);
                                                } 
                                                else { 
                                                    //echo "File downloading failed."; 
                                                } 
                                            }
                                            
                                              // delete local folder created for images 
                                            Storage::deleteDirectory($folder_name);
                                    }
                                    $parent_product->save();
                                }
                                //add or update item 
                                $item_add_update=Item::where('sku' ,$product[3])->first();
                                if(!$item_add_update) {
                                    $item_add_update= new Item;
                                    $item_add_update->sku=$product[3];
                                }
                                $item_add_update->product_id=$parent_product->id;
                                $item_add_update->mrp=$product[29];
                                $item_add_update->price=$product[4];
                                $item_add_update->dimentions=$product[36];
                                $item_add_update->weight=$product[38];
                                $item_add_update->quantity=$product[5];
                                $item_add_update->variants=empty($product[40])? NULL : $product[40];
                                //$item_add_update->attributes=$product[42];
                                $item_add_update->active=$product[28]==='Active'? true: false;
                                $item_add_update->dimension_unit=empty($product[37]) ? 'inches':$product[37];
                                $item_add_update->weight_unit=empty($product[39]) ? 'pounds' : $product[39];
                                $item_add_update->sync_amazon=true;
                                $item_add_update->asin=$product[31];
                                $item_add_update->amazon_listing_id=$product[2];
                                $item_add_update->save();
                            }
                    }
                    $count+=$j;
                    sleep(1+(0.1)*($count/10));
                    //flush();
                }
                else {
                break;
                }
            }
        }
        else {
            return false;
        }
        return true;
    }

    public function xml_attribute($object, $attribute)
    {
      if(isset($object[$attribute]))
          return (string) $object[$attribute];
    }

    public function CheckAmazonRequestProcessing($amazon_client,$ReportRequestId){
        $get_report_request_response=$amazon_client->invoke(array('Action'=> 'GetReportRequestList','ReportRequestIdList.Id.1'=> $ReportRequestId),'2009-01-01','/',false);
        $request_report_response_xml = XmlParser::extract($get_report_request_response);
        $request_report_response_result = $request_report_response_xml->parse([
                                    'list' => ['uses' => 'GetReportRequestListResult.ReportRequestInfo[ReportProcessingStatus,GeneratedReportId]'],
                                    ]);
        if($request_report_response_result['list'][0]['ReportProcessingStatus']=='_DONE_') {
            return $request_report_response_result['list'][0]['GeneratedReportId'];
        }
        else {
            return 0;
        }      
    }

    
}
