<?php 
namespace App\Http\Controllers\Store\Channels;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Store\Setting;

class ChannelController extends Controller{

    public function ChannelList(Request $request){

        try {
              $settings = Setting::get();
              $result = [];

              array_push($result, $this->get_amazon_integration($settings));
              array_push($result, $this->get_flipkart_integration($settings));

              return response()->json( $result );

        } catch (\Exception $e) {
              $error_obj=array('status'=>'fail','message'=> $e->getMessage());
              return response()->json($error_obj, 400);
        }
        

    }

    public function get_amazon_integration( $settings ){

        $integration  =  $settings->where('key', 'amazon_integration')->first();
        $verified     =  $settings->where('key', 'amazon_verified')->first();
        $sync_enable  =  $settings->where('key', 'amazon_order_sync_automation')->first();
        $last_sync_at =  $settings->where('key', 'amazon_order_last_sync_time')->first();
        $location     =  $settings->where('key', 'amazon_store_id')->first();

        if(
            !empty( $integration ) &&
            !empty( $verified )   &&
            boolval( $integration->value ) === true &&
            boolval( $verified->value ) === true
        ){
            
           $last_sync_at_value = ( !empty($last_sync_at) )? $this->k_date_parse( $last_sync_at->value ): null;
           $sync_enable_value = ( !empty($sync_enable) )? boolval($sync_enable->value): false;
           $location_value = !empty( $location )? $location->value: null;
            
           return  [
                'name'         => 'amazon' ,
                'sync_enable'  => $sync_enable_value,
                'last_sync_at' => $last_sync_at_value,
                'connected'    => true,
                'location'     => $location_value,
           ];
            
        }else{

            return  [
                'name'         => 'amazon' ,
                'sync_enable'  => false,
                'last_sync_at' => null,
                'connected'    => false,
                'location'     => null,
            ];
        }
    }

    public function get_flipkart_integration( $settings ){

        $integration  = $settings->where('key', 'flipkart_integration')->first();
        $verified     = $settings->where('key', 'flipkart_verified')->first();
        $sync_enable  = $settings->where('key', 'flipkart_order_sync_automation')->first();
        $last_sync_at = $settings->where('key', 'flipkart_order_last_sync_time')->first();
        $location     = $settings->where('key', 'flipkart_store_id')->first();

        if(
            $verified !== null &&
            $integration !== null &&
            boolval($integration->value) === true &&
            boolval($verified->value)    === true
        ){
           
          $last_sync_at_value = (!empty($last_sync_at))? $this->k_date_parse($last_sync_at->value): null;
          $sync_enable_value = (!empty($sync_enable))? boolval($sync_enable->value): false;
          $location_value = !empty( $location )? $location->value: null;

          return  [
                'name'         => 'flipkart' ,
                'sync_enable'  => $sync_enable_value,
                'last_sync_at' => $last_sync_at_value,
                'connected'    => true,
                'location'     => $location_value,
           ];
            
        }else{
            
            return  [
                'name'         => 'flipkart' ,
                'sync_enable'  => false,
                'last_sync_at' => null,
                'connected'    => false,
                'location'     => null,
            ];
        }
    }

    public function k_date_parse( $date_str ){

        try {
            $date = explode('T', $date_str)[0];
            $time = explode('.' ,explode('T', $date_str)[1])[0];
            return $date . ' ' . $time;
        } catch (\Exception $e) {
            return null;
        }
    }

}