<?php

namespace App\Http\Controllers\Store\Orders;

use App\User;
use App\Store\Order;
use App\Store\OrderReturn;
use App\Helper\GenerateOrderRef;
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
use App\Store\Lineitem;
use App\Store\Customer;
use App\Store\Item;

class ReturnController extends Controller
{
    
    /**
     * Get  Orders.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ReturnList(Request $request)
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
        $total_returns_count=0;
        $return_output=[];
        if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
            if(isset($filter['q']) && !empty($filter['q'])) {
                $returns= OrderReturn::where('order_ref', 'like', '%'.$filter['q'].'%')->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                $total_returns_count= OrderReturn::select(DB::raw('count(*) as total_count'))->where('order_ref', 'like', '%'.$filter['q'].'%')->first();
            }
            else {
                $returns= OrderReturn::orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                $total_returns_count= OrderReturn::select(DB::raw('count(*) as total_count'))->first();
            } 
            
           
        }
      
        else {
            if(isset($filter['id']) && !empty($filter['id'])) {
                $returns= OrderReturn::whereIn('id', $filter['id'])->get();
                $total_returns_count= OrderReturn::select(DB::raw('count(*) as total_count'))->whereIn('id', $filter['id'])->first();
            }
            else {
                $returns=OrderReturn::get();
                $total_returns_count= OrderReturn::select(DB::raw('count(*) as total_count'))->first();
            }
            
        }
        
        foreach ($returns as $return) {
            $lineitems=[];
            if(!empty($return->lineitem_id)) {
                $lineitems['lineitem_id']=$return->lineitems_id;
                $lineitems['item_id']=$return->lineitem->item_id;
                $lineitems['quantity']=$return->lineitem->quantity;
                $lineitems['sku']=$return->lineitem->item->sku;
            }
            array_push($return_output,array(
            'id' => $return->id,
            'order_ref' => $return->order->order_ref,
            'order_date' => $return->order->order_date,
            'initiate_date' => $return->initiate_date,
            'received_date' => $return->received_date,
            'quantity' => $return->quantity,
            'reason' => $return->reason,
            'type' => $return->type,
            'is_received' => $return->is_received,
            'is_good_inventory' => $return->is_good_inventory,
            'is_inventory_adjusted' => $return->is_inventory_adjusted,
            'inventory_adjusted_date' => $return->inventory_adjusted_date,
            'lineitems' => $lineitems,
            'notes' => $return->notes
            ));
        }
        return response()->json($return_output)->header('X-Total-Count', isset($total_returns_count->total_count) ? $total_returns_count->total_count : 0);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }

    /**
     * Show Return 
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ReturnShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $return=OrderReturn::find($id);
        $lineitems=[];
        if(!empty($return->lineitem_id)) {
            $lineitems['lineitem_id']=$return->lineitems_id;
            $lineitems['item_id']=$return->lineitem->item_id;
            $lineitems['quantity']=$return->lineitem->quantity;
            $lineitems['sku']=$return->lineitem->item->sku;
        }
        return response()->json([
            'status' => "success",
            'id' => $return->id,
            'order_ref' => $return->order->order_ref,
            'order_date' => $return->order->order_date,
            'initiate_date' => $return->initiate_date,
            'received_date' => $return->received_date,
            'quantity' => $return->quantity,
            'reason' => $return->reason,
            'type' => $return->type,
            'is_received' => $return->is_received,
            'is_good_inventory' => $return->is_good_inventory,
            'is_inventory_adjusted' => $return->is_inventory_adjusted,
            'inventory_adjusted_date' => $return->inventory_adjusted_date,
            'lineitems' => $lineitems,
            'notes' => $return->notes,
            'quantity_received' => $return->quantity_received
        ]);
        }
    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Create User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function ReturnEdit(Request $request,$id)
    {
        $api_auth = App::make(ApiAuth::class);
        DB::beginTransaction();
        try {
        $input_array = $request->json()->all();
        // $validation = Validator::make($input_array, [
        //     'customer_id' => 'required',
        //     'order_date' => 'required',
        //     'status' => 'required',
        //     'delivery_amount' => 'required',
        //     'lineitems.*.item_id' => 'required',
        //     'lineitems.*.quantity' => 'required',
        //     'lineitems.*.unit_price' => 'required',
        // ]);
        // if ($validation->fails()) {
        //     $errors = $validation->errors();
        //     $error_obj = array('status' => 'fail', 'message' => 'validation error');
        //     return response()->json($error_obj, 400);
        // }
        $return= OrderReturn::find($id);
        if($input_array['is_received'] && $input_array['quantity_received'] > 0 && $input_array['is_good_inventory'] && !$return->is_inventory_adjusted) {
            // Add to Inventory 
            $item=$return->lineitem->item;
            $item->quantity+=$input_array['quantity_received'];
            $item->save();
            $return->quantity_received=$input_array['quantity_received'];
            $return->is_inventory_adjusted=true;
            $return->is_good_inventory=true;
            $return->inventory_adjusted_date=Carbon::now();
        }
    
        // Save return 
        $return->received_date=isset($input_array['received_date']) ? $input_array['received_date'] : null;
        $return->is_received=isset($input_array['is_received']) ? $input_array['is_received'] : false;
        $return->notes=$input_array['notes'];
        $return->save();
        // Commit Transaction
        DB::commit();
        return response()->json(['status' => "success","message" => "Successfully Order Updated"],200);
        }
    catch(\Exception $e) {
        // Rollback Transaction
        DB::rollback();
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    
  
}
