<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Google\Cloud\Storage\StorageClient;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\ProfilePicture as Picture;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Helper\ApiAuth;
use App;
use App\User;
use App\Client;


class ProfilePictureController extends Controller
{
    //

    private $gcp_bucket, $gcp_bucket_name = '';


    function __construct(){

        $storage = new StorageClient([
            'keyFilePath' => env('GCP_STORAGE_KEY_FILE_PATH')
        ]);
        $this->gcp_bucket_name = env('GCP_AVATAR_BUCKET');
        $this->gcp_bucket      =  $storage->bucket( $this->gcp_bucket_name );

    }


    public function index(Request $request){

        try {

            $query = $request->all();

            if(isset($query['range'])){
                $range = json_decode($query['range'],true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'],true);
            }

            $query = Picture::query();

            if( isset($range) && isset($sort) &&
                count($range)==2 && count($sort)==2 ) {
                   
                  $pictures = $query->orderBy($sort[0], $sort[1])
                                    ->offset($range[0])
                                    ->limit(($range[1]-$range[0])+1)
                                    ->get();
                  $total_picture = $query->count();


            }else{
                  $pictures = $query->get();

                  $total_picture = $query->count();
            }

            $picture_arr = [];

            foreach($pictures as $pic){
                array_push( $picture_arr, [
                    'id'         => $pic->id,
                    'src'        => route('profile_picture', $pic->name) ,
                    'name'       => $pic->name,
                    'created_at' => $pic->created_at
                ]);
            }

            return response()->json( $picture_arr )->header('X-Total-Count', $total_picture);

        } catch (Exception $e) {
            $error_obj = array('status'=>'fail','message'=> $e->getMessage());
            return response()->json( $error_obj, 500 );
        }

    }

    public function store(Request $request){


        try{
          
          $folder = Str::random(15);

          $profiles    = []; 

          foreach ($request->pictures as $picture ) {

              $src        = $picture['src'];
              $title      = $picture['title'];
              $extension  = explode('/', explode(':', substr($src, 0, strpos($src, ';')))[1])[1];
              $replace    = substr($src, 0, strpos($src, ',') + 1);
              $image      = str_replace($replace, '', $src); 
              $image      = str_replace(' ', '+', $image);
              $file_name  = Str::random(12) ;
              $file       = $file_name . '.' . $extension;
              Storage::disk('local')->put($folder.'/'.$file, base64_decode($image));
              $file_local_path = Storage::path( $folder . '/' . $file );

              $file_content = fopen($file_local_path, 'r');
              $object = $this->gcp_bucket->upload($file_content, [
                  'name' => $folder.'/'.$file
              ]);
              $profiles[] = [
                    'name'       => $file ,
                    'path'       => $folder ,
                    'bucket'     => $this->gcp_bucket_name,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
              ];

           }
           DB::beginTransaction();
           Picture::insert( $profiles );
           DB::commit();
           $success_obj = ["status" => "success","message" => "Profile Picture uploaded successfuly"];
           return response()->json( $success_obj, 200);

        }catch(\Exception $e){
            DB::rollback();
            $error_obj = array('status'=>'fail','message'=> $e->getMessage());
            return response()->json( $error_obj, 500 );
        }
    }

    public function ShowImage( $name ){

        try {
            

            $picture = Picture::where('name', $name)->first();
            $object = $this->gcp_bucket->object( $picture->path . '/' . $picture->name);
            $content = $object->downloadAsStream();



            $type = explode('.',  $picture->name)[ count(explode('.',  $picture->name)) - 1];
            return response( $content )->withHeaders([
                'Content-Type' => '',
                'Content-Disposition' => 'inline; filename="'.$picture->name.'"'
            ]);

        } catch (\Exception $e) {
            return abort(404);
        }

    }

    public function SetProfilePicture(Request $request){

        try {

            $api_auth = App::make(ApiAuth::class);

            $input_array = $request->json()->all();

            $validation = Validator::make($input_array, [
                'profile_picture_id' => 'required|exists:profile_pictures,id',
                'role'               => [
                   'required',
                    Rule::in(['client', 'user'])
                ],
            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => $errors->first());
                return response()->json($error_obj, 405);
            }

            $user_info = $api_auth->user();

            $entity = $request->role == 'client'? 
                                         Client::find( $user_info->client_id): 
                                         User::find( $user_info->user_id );
       
            $entity->profile_picture_id = $request->profile_picture_id;
            $entity->save();

            $success_obj = ["status" => "success","message" => "Profile picture updated"];
            return response()->json( $success_obj, 200);
        
        } catch (\Exception $e) {
            DB::rollback();
            $error_obj = array('status'=>'fail','message'=> $e->getMessage());
            return response()->json( $error_obj, 500 );
        } 
    }
}
