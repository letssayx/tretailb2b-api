<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Http\Request;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

use App\Http\Controllers\AdminController;
use App\Http\Controllers\PublicController;

use App\Mail\StoreSignup;
use App\Jobs\ProcessPodcast;
use App\Services\AudioProcessor;

use App\Verification;
use App\Client;
use App\Role;
use App\User;

use App\Request as SignupRequest;
use App\Store\Category;

use Carbon\Carbon;
use Artisan;

class ProcessSignup implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    protected $inputs;
    public function __construct(array $inputs) {
        //
        $this->inputs = $inputs;
    }
    /**
    * Execute the job.
    * @param  AudioProcessor 
    * @return void
    */
    public function handle()
    {
        try {
            // $email_validation_token=Str::random(30);
            // $new_request= new SignupRequest;
            // $verification_link = env('STORE_SIGNUP_VERIFICATION_URL')."?token=".$email_validation_token;
            // Mail::to($this->inputs['email'])->send(new StoreSignup($verification_link));
            // $verification=new Verification;
            // $verification->email=$this->inputs['email'];
            // $verification->validation_token=$email_validation_token;
            // $verification->type='SIGNUP';
            // $verification->valid_to=Carbon::now()->addDay(1);
            // $verification->reference=$new_request->id;
            // $verification->save();
            //Log::info('test1');
            $schemaName=$this->db_name_generate();
            $db_user="tenant_".$schemaName;
            $db_pass= $this->password_generate(10);

            DB::statement('CREATE DATABASE IF NOT EXISTS '.$schemaName);

            DB::statement('CREATE USER IF NOT EXISTS \''.$db_user.'\'@\'%\' IDENTIFIED BY \''.$db_pass.'\'');
            DB::statement('GRANT ALL PRIVILEGES ON '.$schemaName.'.* TO \''.$db_user.'\'@\'%\'');
            // tenant DB migrations 

            DB::purge('mysql-null'); 
            \Config::set('database.connections.mysql-null', array(
            'driver'    => env('DB_CONNECTION', 'mysql'),
            'host'      => env('DB_HOST', '127.0.0.1'),
            'database'  => $schemaName,
            'username'  => $db_user,
            'password'  => $db_pass,
            'port'      => env('DB_PORT', '3306'),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            ));

            DB::reconnect('mysql-null');
            Artisan::call('migrate', [
            '--database'  => 'mysql-null',
            '--path'      => 'database/tenant-migrations',
            '--force'     => true,
            ]);

            // Add master table client info after successful creation 
            $client= new Client();
            $client->name= $this->inputs['name'];
            $client->address= '';
            $client->phone= '';
            $client->email= $this->inputs['email'];
            $client->active=false;
            $client->db_name= $schemaName;
            $client->db_user= $db_user;
            $client->db_pass= $db_pass;
            $client->client_ref = $this->generate_client_ref();
            $client->save();

            $user= new User;
            $user->name= $this->inputs['name'];
            $user->email= $this->inputs['email'];
            // $user->password = Hash::make($this->inputs['password']);
            $user->is_admin = isset($this->inputs['is_admin']) ? $this->inputs['is_admin'] : false;
            $user->active=false;
            $user->save();

            $permissions=[];
            $permissions['products']='POST';
            $permissions['brands']='POST';
            $permissions['manufacturers']='POST';
            $permissions['countries']='POST';
            $permissions['categories']='POST';
            $permissions['subcategories']='POST';
            $permissions['items']='POST';
            $permissions['orders']='POST';
            $permissions['customers']='POST';
            $permissions['settings']='POST';
            $permissions['tasks']='POST'; 
            $permissions['logs']='POST';
            $permissions['teams']='POST';
            $permissions['transactions']='POST';
            $permissions['returns']='POST';
            $permissions['bundles']='POST';
            $permissions['picklist']='POST';

            $role= new Role;
            $role->client_id = $client->id;
            $role->user_id = $user->id;
            $role->permissions = json_encode($permissions);
            $role->save();

            $client->primary_user_id = $role->user_id;
            $client->save();

            $this->category_insert($client);

        } catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            print_r($error_obj);
        }
    }

    public function clean_str($string) 
    {
    $string = str_replace(' ', '_', $string); // Replaces all spaces with hyphens.

    return strtolower(preg_replace('/[^A-Za-z0-9\-]/', '', $string)); // Removes special chars & lower.
    }

    public function password_generate($chars) 
    {
    $data = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz';
    return substr(str_shuffle($data), 0, $chars);
    }

    public function db_name_generate(){

    return 'db_' . $this->password_generate(8);

    }

    public function generate_client_ref(){


    while(true){
    $rand = random_int(100000,999999);
    $client = Client::where('client_ref', $rand)->first();

    if( empty( $client ) ){

    return $rand ;

    }
    }

    }

    public function category_insert(Client $client){

    // try {

    DB::purge(env('DB_CONNECTION', 'mysql')); 
    \Config::set('database.connections.mysql', array(
    'driver'    => env('DB_CONNECTION', 'mysql'),
    'host'      => env('DB_HOST', '127.0.0.1'),
    'database'  => $client->db_name,
    'username'  => $client->db_user,
    'password'  => $client->db_pass,
    'port'      => $client->db_port,
    'unix_socket' => env('DB_SOCKET', ''),
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
    'prefix_indexes' => true,
    'strict' => true,
    'engine' => null,
    ));

    DB::reconnect(env('DB_CONNECTION', 'mysql'));

    // DB::beginTransaction();
    $f    = fopen( public_path() . '/categories.en-US.csv', "r");
    $rows = [];

    while ( ($data = fgetcsv($f, 1000, ",")) !== FALSE) 
    {        
    $rows[] = $data; 
    }

    fclose($f);

    foreach( $rows as $single_row){
    $category_name     = $single_row[1];
    $sub_category_name = $single_row[2];

    $category     = Category::where('name', $category_name)->first();
    if(empty($category)){
    $category       = new Category;
    $category->name = $category_name;
    $category->save();
    }

    $sub_category       = new Category;
    $sub_category->name = $sub_category_name;
    $sub_category->parent_category_id = $category->id;
    $sub_category->save();
    }
    // DB::commit();
    // } catch (\Exception $e) {
    //     Log::debug( $e->getMessage() );
    //     DB::rollback();
    // }
    }
}
