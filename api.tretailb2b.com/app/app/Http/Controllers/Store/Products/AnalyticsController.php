<?php
namespace App\Http\Controllers\Store\Products;

use Illuminate\Http\Request;
use App\Store\Analytic;
use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends Controller
{
    // 
    public function inventoryReorder (Request $request) {
        try {
            //code here
            $query = $request->all();
            if(isset($query['filter'])){
                $filter = json_decode($query['filter'], true);
            }
            if(isset($query['range'])){
                $range = json_decode($query['range'], true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'], true);
            }            
            
            $validation = Validator::make( $filter , [
                'marketplace' => [
                    'required' ,
                     Rule::in(['amazon','store','flipkart', 'all']) 
                ],
            ]);
    
            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'Validation error!');
                return response()->json( $errors, 405);
            }
            $data_key =  join('_', [   $filter['marketplace'],
                                       'reorder_within', 
                                       $this->getReorderDayKey((int) $filter['reorder_within']),
                                       'avg_sales_period',
                                       $this->getAverageSalesDayKey((int) $filter['average_sales']),
                                   ]);
                                   
            $analytics = Analytic::where('key', $data_key )->first();

            if( !empty( $analytics ) ) {
                $data = json_decode( $analytics->data, true);
            } else {
                $data = [];
            }
            $collection = collect( $data );

            if(isset($filter) && isset($filter['q']) && !empty($filter['q'])) {
                $search = $filter['q'];
                $collection = $collection->filter(function($item) use ($search) {
                    return stripos($item['sku'],$search) !== false;
                });
            }
            $total = $collection->count();
            if(isset($range) && count( $range ) == 2 && $range[0] >= 0 && $range[1] > 1){
                $collection = $collection->skip( $range[0] )->take(( ( $range[1]-$range[0] ) + 1 ));
            }
            $result = $collection->all();

            return response()->json( $result )->header('X-Total-Count', $total );
        } catch(\Exception $e) {
            // error handler
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }
    
    // Method to fetch basic analytics data i.e. Average Order Value, Average Sales
    public function basicAnalytics (Request $request) {
        try {
            // Get Average order value last 30 days
            $query = $request->all();
            if(isset($query['filter'])){
                $filter = json_decode($query['filter'], true);
            }
            if(isset($query['range'])){
                $range = json_decode($query['range'], true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'], true);
            }            
            
            $validation = Validator::make( $filter , [
                'marketplace' => [
                    'required' ,
                     Rule::in(['all','amazon','flipkart','store']) 
                ],
            ]);
    
            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'Validation error!');
                return response()->json( $errors, 405);
            }
            $data_key = $filter['marketplace'].'_basic_analytics';

            $analytics = Analytic::where('key', $data_key )->first();

            if( !empty( $analytics ) ) {
                $data = json_decode( $analytics->data, true);
            } else {
                $data = [];
            }
            $collection = collect( $data );

            if(isset($filter) && isset($filter['q']) && !empty($filter['q'])) {
                $search = $filter['q'];
                $collection = $collection->filter(function($item) use ($search) {
                    return stripos($item['sku'],$search) !== false;
                });
            }
            $total = $collection->count();
            if(isset($range) && count( $range ) == 2 && $range[0] >= 0 && $range[1] > 1){
                $collection = $collection->skip( $range[0] )->take(( ( $range[1]-$range[0] ) + 1 ));
            }
            $result = $collection->all();

            return response()->json( $result )->header('X-Total-Count', $total );
        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    // Method to fetch state wise sales filtered by days
    public function statewiseSales (Request $request){
        try {
            $query = $request->all();
            if(isset($query['filter'])){
                $filter = json_decode($query['filter'], true);
            }
            if(isset($query['range'])){
                $range = json_decode($query['range'], true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'], true);
            }

            $validation = Validator::make( $filter , [
                'marketplace' => [
                    'required' ,
                    Rule::in(['amazon','store','flipkart', 'all']) 
                ],
                'days_ago' => [
                    'required' ,
                    Rule::in([0, 1, 15, 30, 45, 60, 90]) 
                ],
                'states' => [
                    'required' ,
                    Rule::in(['all','andhra pradesh','arunachal pradesh','assam','bihar','chattisgarh','goa','gujarat','haryana','himachal pradesh','jharkhand','karnataka','kerala','madhya pradesh','maharashtra','manipur','meghalaya','mizoram','nagaland','odisha','punjab','rajasthan','sikkim','tamil nadu','telengana','tripura','uttarakhand','uttar pradesh','west bengal','andaman and nicobar islands','chandigarh','dadra and nagar haveli and daman & diu','new delhi','jammu & kashmir','ladakh','lakshadweep','puducherry'])
                ],
            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json( $errors, 405);
            }

            $data_key = join('_', [ $filter['marketplace'], 
                                    $this->getDayKey((int) $filter['days_ago']), 
                                    $filter['states'].'_wise_sales'
                        ]);
            $analytics = Analytic::where('key', $data_key )->first();
            if( !empty( $analytics ) ) {
                $data = json_decode( $analytics->data, true);
            } else {
                $data = [];
            }

            $collection = collect( $data );

            if(isset($filter) && isset($filter['q']) && !empty($filter['q'])) {
                $search = $filter['q'];
                $collection = $collection->filter(function($item) use ($search) {
                    return stripos($item['sku'],$search) !== false;
                });
            }
            $total = $collection->count();
            if(isset($range) && count( $range ) == 2 && $range[0] >= 0 && $range[1] > 1){
                $collection = $collection->skip( $range[0] )->take(( ( $range[1]-$range[0] ) + 1 ));
            }
            $result = $collection->all();
            return response()->json( $result )->header('X-Total-Count', $total );
        }
        catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    public function topSales(Request $request){

        try {

            $query = $request->all();
            if(isset($query['filter'])){
                $filter = json_decode($query['filter'], true);
            }
            if(isset($query['range'])){
                $range = json_decode($query['range'], true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'], true);
            }

            $validation = Validator::make( $filter , [
                'marketplace' => [
                    'required' ,
                     Rule::in(['amazon','store','flipkart', 'all']) 
                ],
                'days_ago'    => [
                    'required' ,
                     Rule::in([0, 1, 15, 30, 45, 60, 90]) 
                ]

            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json( $errors, 405);
            }

            $data_key =  join('_', [   $filter['marketplace'], 
                                       $this->getDayKey((int) $filter['days_ago']), 
                                       'top_sales' 
                                   ]);

            $analytics = Analytic::where('key', $data_key )->first();
            if( !empty( $analytics ) ){
               $data = json_decode( $analytics->data , true);
            }else{
                $data = [];
            }

            $collection = collect( $data );

            if(isset($filter) && isset($filter['q']) && !empty($filter['q'])) {
                $search = $filter['q'];
                $collection = $collection->filter(function($item) use ($search) {
                    return stripos($item['sku'],$search) !== false;
                });
            }
            $total   = $collection->count();
            if(isset($range) && count( $range ) == 2 && $range[0] >= 0 && $range[1] > 1){
                $collection = $collection->skip( $range[0] )->take(( ( $range[1]-$range[0] ) + 1 ));
            }
            $result  = $collection->all();
            return response()->json( $result )->header('X-Total-Count', $total );

        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }

    public function mediumSales(Request $request){

        try {

            $query = $request->all();

            if(isset($query['filter'])){
                $filter = json_decode($query['filter'], true);
            }
            if(isset($query['range'])){
                $range = json_decode($query['range'], true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'], true);
            }

            $validation = Validator::make( $filter , [
                'marketplace' => [
                    'required' ,
                     Rule::in(['amazon','store','flipkart', 'all']) 
                ],
                'days_ago'    => [
                    'required' ,
                     Rule::in([0, 1, 15, 30, 45, 60, 90]) 
                ]

            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json( $errors, 405);
            }

            $data_key =  join('_', [   $filter['marketplace'], 
                                       $this->getDayKey((int) $filter['days_ago']), 
                                       'medium_sales' 
                                   ]);

            $analytics = Analytic::where('key', $data_key )->first();
            if( !empty( $analytics ) ){
               $data = json_decode( $analytics->data , true);
            }else{
                $data = [];
            }

            $collection = collect( $data );

            if(isset($filter) && isset($filter['q']) && !empty($filter['q'])) {
                $search = $filter['q'];
                $collection = $collection->filter(function($item) use ($search) {
                    return stripos($item['sku'],$search) !== false;
                });
            }
            $total   = $collection->count();
            if(isset($range) && count( $range ) == 2 && $range[0] >= 0 && $range[1] > 1){
                $collection = $collection->skip( $range[0] )->take(( ( $range[1]-$range[0] ) + 1 ));
            }
            $result  = $collection->all();
            return response()->json( $result )->header('X-Total-Count', $total );

        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
        

    }

    public function lowSales(Request $request){

        try {

            $query = $request->all();

            if(isset($query['filter'])){
                $filter = json_decode($query['filter'], true);
            }
            if(isset($query['range'])){
                $range = json_decode($query['range'], true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'], true);
            }

            $validation = Validator::make( $filter , [
                'marketplace' => [
                    'required' ,
                     Rule::in(['amazon','store','flipkart', 'all']) 
                ],
                'days_ago'    => [
                    'required' ,
                     Rule::in([0, 1, 15, 30, 45, 60,90]) 
                ]

            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json( $errors, 405);
            }

            $data_key =  join('_', [   $filter['marketplace'], 
                                       $this->getDayKey((int) $filter['days_ago']), 
                                       'low_sales' 
                                   ]);

            $analytics = Analytic::where('key', $data_key )->first();
            if( !empty( $analytics ) ){
               $data = json_decode( $analytics->data , true);
            }else{
                $data = [];
            }

            $collection = collect( $data );

            if(isset($filter) && isset($filter['q']) && !empty($filter['q'])) {
                $search = $filter['q'];
                $collection = $collection->filter(function($item) use ($search) {
                    return stripos($item['sku'],$search) !== false;
                });
            }
            $total   = $collection->count();
            if(isset($range) && count( $range ) == 2 && $range[0] >= 0 && $range[1] > 1){
                $collection = $collection->skip( $range[0] )->take(( ( $range[1]-$range[0] ) + 1 ));
            }
            $result  = $collection->all();
            return response()->json( $result )->header('X-Total-Count', $total );

        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }

    public function worstProducts(Request $request){

        try {

            $query = $request->all();

            if(isset($query['filter'])){
                $filter = json_decode($query['filter'], true);
            }
            if(isset($query['range'])){
                $range = json_decode($query['range'], true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'], true);
            }

            $validation = Validator::make( $filter , [
                'marketplace' => [
                    'required' ,
                     Rule::in(['amazon','store','flipkart', 'all']) 
                ],
                'days_ago'    => [
                    'required' ,
                     Rule::in([0, 1, 15, 30, 45, 60,90]) 
                ]

            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json( $errors, 405);
            }

            $data_key =  join('_', [   $filter['marketplace'], 
                                       $this->getDayKey((int) $filter['days_ago']), 
                                       'worst_products' 
                                   ]);

            $analytics = Analytic::where('key', $data_key )->first();
            if( !empty( $analytics ) ){
               $data = json_decode( $analytics->data , true);
            }else{
                $data = [];
            }

            $collection = collect( $data );

            if(isset($filter) && isset($filter['q']) && !empty($filter['q'])) {
                $search = $filter['q'];
                $collection = $collection->filter(function($item) use ($search) {
                    return stripos($item['sku'],$search) !== false;
                });
            }
            $collection = $collection->sortBy('id');
            $total   = $collection->count();
            if(isset($range) && count( $range ) == 2 && $range[0] >= 0 && $range[1] > 1){
                $collection = $collection->skip( $range[0] )->take(( ( $range[1]-$range[0] ) + 1 ));
            }
            $result  = $collection->all();
            return response()->json( $result )->header('X-Total-Count', $total );

        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }

    public function cancelledProducts(Request $request){

        try {

            $query = $request->all();

            if(isset($query['filter'])){
                $filter = json_decode($query['filter'], true);
            }
            if(isset($query['range'])){
                $range = json_decode($query['range'], true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'], true);
            }

            $validation = Validator::make( $filter , [
                'marketplace' => [
                    'required' ,
                     Rule::in(['amazon','store','flipkart', 'all']) 
                ],
                'days_ago'    => [
                    'required' ,
                     Rule::in([0, 1, 15, 30, 45, 60, 90]) 
                ]

            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json( $errors, 405);
            }

            $data_key =  join('_', [   $filter['marketplace'], 
                                       $this->getDayKey((int) $filter['days_ago']), 
                                       'cancelled' . '_products' 
                                   ]);

            $analytics = Analytic::where('key', $data_key )->first();
            if( !empty( $analytics ) ){
               $data = json_decode( $analytics->data , true);
            }else{
                $data = [];
            }

            $collection = collect( $data );

            if(isset($filter) && isset($filter['q']) && !empty($filter['q'])) {
                $search = $filter['q'];
                $collection = $collection->filter(function($item) use ($search) {
                    return stripos($item['sku'],$search) !== false;
                });
            }
            $collection = $collection->sortByDesc('cancel_count');
            $total   = $collection->count();
            if(isset($range) && count( $range ) == 2 && $range[0] >= 0 && $range[1] > 1){
                $collection = $collection->skip( $range[0] )->take(( ( $range[1]-$range[0] ) + 1 ));
            }
            $result  = $collection->all();
            return response()->json( $result )->header('X-Total-Count', $total );

        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }


    public function returnedProducts(Request $request){

        try {

            $query = $request->all();

            if(isset($query['filter'])){
                $filter = json_decode($query['filter'], true);
            }
            if(isset($query['range'])){
                $range = json_decode($query['range'], true);
            }
            if(isset($query['sort'])){
                $sort = json_decode($query['sort'], true);
            }

            $validation = Validator::make( $filter , [
                'marketplace' => [
                    'required' ,
                     Rule::in(['amazon','store','flipkart', 'all']) 
                ],
                'days_ago'    => [
                    'required' ,
                     Rule::in([0, 1, 15, 30, 45, 60, 90]) 
                ]

            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json( $errors, 405);
            }

            $data_key =  join('_', [   $filter['marketplace'], 
                                       $this->getDayKey((int) $filter['days_ago']), 
                                       'returned' . '_products' 
                                   ]);

            $analytics = Analytic::where('key', $data_key )->first();
            if( !empty( $analytics ) ){
               $data = json_decode( $analytics->data , true);
            }else{
                $data = [];
            }

            $collection = collect( $data );

            if(isset($filter) && isset($filter['q']) && !empty($filter['q'])) {
                $search = $filter['q'];
                $collection = $collection->filter(function($item) use ($search) {
                    return stripos($item['sku'],$search) !== false;
                });
            }
            $collection = $collection->sortByDesc('return_count');
            $total   = $collection->count();
            if(isset($range) && count( $range ) == 2 && $range[0] >= 0 && $range[1] > 1){
                $collection = $collection->skip( $range[0] )->take(( ( $range[1]-$range[0] ) + 1 ));
            }
            $result  = $collection->all();
            return response()->json( $result )->header('X-Total-Count', $total );

        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }

    public function getDayKey(int $day){
        $data = [ 
            0  => '00_days_ago',
            1  => '01_days_ago',
            15 => '15_days_ago',
            30 => '30_days_ago',
            45 => '45_days_ago',
            60 => '60_days_ago',
            90 => '90_days_ago'
        ];

        return $data[ $day ];
    }

    public function getReorderDayKey(int $day){
        $data = [ 
            0  => '00_days',
            1  => '01_days',
            7  => '07_days',
           15  => '15_days',
           30  => '30_days',
           45  => '45_days',
           60  => '60_days',
           90  => '90_days'
        ];

        return $data[ $day ];
    }

    public function getAverageSalesDayKey(int $day){
        $data = [ 
            0  => '00_days',
            1  => '01_days',
            7  => '07_days',
           15  => '15_days',
           30  => '30_days',
           45  => '45_days',
           60  => '60_days',
           90  => '90_days'
        ];

        return $data[ $day ];
    }
}
