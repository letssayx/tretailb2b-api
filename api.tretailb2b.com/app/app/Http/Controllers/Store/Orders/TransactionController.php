<?php

namespace App\Http\Controllers\Store\Orders;

use App\User;
use App\Store\Order;
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
use App\Store\Transaction;

class TransactionController extends Controller
{
    
    /**
     * Get  Orders.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function TransactionList(Request $request)
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
        $total_transactions_count=0;
        $transactions_output=[];
        if(isset($filter['order_id'])) {
            $trsanctions=Transaction::where('order_id',$filter['order_id'])->get();
        }
        else if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
            if(isset($filter['q']) && !empty($filter['q'])) {
                $trsanctions= Transaction::where('settlement_id', 'like', '%'.$filter['q'].'%')->orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                $total_transactions_count= Transaction::select(DB::raw('count(*) as total_count'))->where('settlement_id', 'like', '%'.$filter['q'].'%')->first();
            }
            else {
                $trsanctions= Transaction::orderBy($sort[0], $sort[1])->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                $total_transactions_count= Transaction::select(DB::raw('count(*) as total_count'))->first();
            } 
            
           
        }
        else {
            if(isset($filter['id']) && !empty($filter['id'])) {
                $trsanctions= Transaction::whereIn('id', $filter['id'])->get();
                $total_transactions_count= Transaction::select(DB::raw('count(*) as total_count'))->whereIn('id', $filter['id'])->first();
            }
            else {
                $trsanctions=Transaction::get();
                $total_transactions_count= Transaction::select(DB::raw('count(*) as total_count'))->first();
            }
            
        }
        
        return response()->json($trsanctions)->header('X-Total-Count', isset($total_transactions_count->total_count) ? $total_transactions_count->total_count : 0);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
          }
    }


    /**
     * Create Order.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function TransactionCreate(Request $request)
    {
        $api_auth = App::make(ApiAuth::class);
        DB::beginTransaction();
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'customer_id' => 'required',
            'order_date' => 'required',
            'status' => 'required',
            'delivery_amount' => 'required',
            'lineitems.*.item_id' => 'required',
            'lineitems.*.quantity' => 'required',
            'lineitems.*.unit_price' => 'required',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'validation error');
            return response()->json($error_obj, 405);
        }
        // add order data 
        $order= new Order;
        $order->customer_id= $input_array['customer_id'];
        $order->order_ref=Str::random(6);
        $order->order_date= $input_array['order_date'];
        $order->delivery_amount= $input_array['delivery_amount'];
        $order->sales_channel= $input_array['sales_channel'];
        $order->delivery_amount= isset($input_array['delivery_amount']) ? $input_array['delivery_amount'] : 0;
        $order->payments= isset($input_array['payments']) ? json_encode($input_array['payments']) : null;
        $order->shipping= isset($input_array['shipping']) ? json_encode($input_array['shipping']) : null;
        $order->order_type= isset($input_array['order_type']) ? $input_array['order_type'] : null;
        $order->archive= isset($input_array['archive']) ? $input_array['archive'] : false;
        //$order->dispatch_by= isset($input_array['dispatch_by']) ? $input_array['dispatch_by'] : false;
        $order->status= $input_array['status'];
        $order->save();
        $igst=false;
        $customer= Customer::find($input_array['customer_id']);
        $seller_state = str_replace(' ','',strtoupper($api_auth->user()->client_details['state']));
        $buyer_state = str_replace(' ','',strtoupper($customer->state));
        if($seller_state!=$buyer_state) {
            $igst=true;
        }
        $total_order_amount=0;
        $total_cgst=0;
        $total_sgst=0;
        $total_igst=0;
        // add line items data
        if($igst) {
            foreach($input_array['lineitems'] as $lineitem) {
                $item= Item::find($lineitem['item_id']);
                $line = new Lineitem();
                $line->order_id=$order->id;
                $line->item_id = $lineitem['item_id'];
                $line->quantity = $lineitem['quantity'];
                $line->unit_price = $lineitem['unit_price'];
                $line_total=$lineitem['unit_price']*$lineitem['quantity'];
                $line_tax=$line_total * $item->product->tax_rate / (100+$item->product->tax_rate);
                $total_order_amount+= $line_total;
                $total_igst+=$line_tax;
                $line->save();
            }
        }
        else {
            foreach($input_array['lineitems'] as $lineitem) {
                $item= Item::find($lineitem['item_id']);
                $line = new Lineitem();
                $line->order_id=$order->id;
                $line->item_id = $lineitem['item_id'];
                $line->quantity = $lineitem['quantity'];
                $line->unit_price = $lineitem['unit_price'];
                $line_total=$lineitem['unit_price']*$lineitem['quantity'];
                $line_tax_cgst=$line_total * ($item->product->tax_rate/2) / (100+($item->product->tax_rate/2));
                $line_tax_sgst=$line_total * ($item->product->tax_rate/2) / (100+($item->product->tax_rate/2));
                $total_order_amount+= $line_total;
                $total_cgst+=$line_tax_cgst;
                $total_sgst+=$line_tax_sgst;
                $line->save();
            }
        }
       
        // add shipping amount to total amount (need to rethink how to represent delivery amount & discount)
        $total_order_amount+= isset($input_array['delivery_amount']) ? floatval($input_array['delivery_amount']) : 0;
        //Calculate GST 
        $order->sum_total= round($total_order_amount,2);
        $order->total_igst= round($total_igst,2);
        $order->total_cgst= round($total_cgst,2);
        $order->total_sgst= round($total_sgst,2);
        $order->save();
        // Commit Transaction
         DB::commit();
        return response()->json(["status" => "success","message" => "Successfully Order Created","id" => $order->id],201);
        }
        catch(\Exception $e) {
         // Rollback Transaction
         DB::rollback();
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }

    /**
     * Show Order.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function TransactionShow($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $order=Order::find($id);
        $lineitems=[];
        foreach ($order->lineitem as $lineitem) {

            array_push($lineitems,array(
                'item_id' => $lineitem->item_id,
                'quantity' => $lineitem->quantity,
                'unit_price' => $lineitem->unit_price,
                'order_item_id' => $lineitem->order_item_id,
                'hsn_code' => $lineitem->item->product->hsn_code,
                'tax_rate' => $lineitem->item->product->tax_rate,
        ));
        }
        //Check if any rerurn / parent order exist
        $parent_order_details=[];
        if(!empty($order->parent_order_id)) {
            $parent_order=$order;
            while(true) {
                $parent_order=Order::find($parent_order->parent_order_id);
                $parent_order_lineitem=[];
                foreach ($parent_order->lineitem as $lineitem) {
                    array_push($parent_order_lineitem,array(
                        'item_id' => $lineitem->item_id,
                        'sku' => $lineitem->item->sku,
                        'quantity' => $lineitem->quantity,
                        'unit_price' => $lineitem->unit_price,
                        'order_item_id' => $lineitem->order_item_id,
                ));
            }
                array_push($parent_order_details, array(
                    'primary_order_id'=> $parent_order->id,
                    'primary_order_ref'=> $parent_order->order_ref,
                    'primary_order_link'=> "/orders/".$parent_order->id,
                    'primary_order_lineitem'=> $parent_order_lineitem,
                    'primary_order_status'=> $parent_order->status,
                    'primary_order_date'=> $parent_order->order_date,
                ));
                if(empty($parent_order->parent_order_id)) {
                break;
                }
            }
        }

        return response()->json([
            'status' => "success",
            'id' => $order->id,
            'customer_id' => $order->customer_id,
            'order_date' => $order->order_date,
            'delivery_amount' => $order->delivery_amount,
            'order_ref' => $order->order_ref,
            'sales_channel' => $order->sales_channel,
            'payments' => json_decode($order->payments,true),
            'shipping' => json_decode($order->shipping,true),
            'archive' => $order->archive,
            'status' => $order->status,
            'lineitems' => $lineitems,
            'sum_total' =>  $order->sum_total,
            'total_igst' =>  $order->total_igst,
            'total_cgst' =>  $order->total_cgst,
            'total_sgst' =>  $order->total_sgst,
            'total_taxable_amount' => ($order->total_igst+$order->total_cgst+$order->total_sgst),
            'invoice_number' =>  $order->invoice_number,
            'order_type' =>  $order->order_type,
            'dispatch_by' =>  $order->dispatch_by,
            'parent_order_details' => $parent_order_details
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
    public function TransactionEdit(Request $request,$id)
    {
        $api_auth = App::make(ApiAuth::class);
        DB::beginTransaction();
        try {
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'customer_id' => 'required',
            'order_date' => 'required',
            'status' => 'required',
            'delivery_amount' => 'required',
            'lineitems.*.item_id' => 'required',
            'lineitems.*.quantity' => 'required',
            'lineitems.*.unit_price' => 'required',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => 'validation error');
            return response()->json($error_obj, 405);
        }
        // add data 
        $order= Order::find($id);
        $order->customer_id= $input_array['customer_id'];
        $order->order_date= $input_array['order_date'];
        $order->delivery_amount= $input_array['delivery_amount'];
        $order->sales_channel= $input_array['sales_channel'];
        $order->delivery_amount= isset($input_array['delivery_amount']) ? $input_array['delivery_amount'] : 0;
        $order->payments= isset($input_array['payments']) ? json_encode($input_array['payments']) : null;
        $order->shipping= isset($input_array['shipping']) ? json_encode($input_array['shipping']) : null;
        $order->order_type= isset($input_array['order_type']) ? $input_array['order_type'] : null;
        $order->archive= isset($input_array['archive']) ? $input_array['archive'] : false;
        $order->status= $input_array['status'];
        //$order->dispatch_by= isset($input_array['dispatch_by']) ? $input_array['dispatch_by'] : false;
        $igst=false;
        $customer= Customer::find($input_array['customer_id']);
        $seller_state = str_replace(' ','',strtoupper($api_auth->user()->client_details['state']));
        $buyer_state = str_replace(' ','',strtoupper($customer->state));
        if($seller_state!=$buyer_state) {
            $igst=true;
        }
        $total_order_amount=0;
        $total_cgst=0;
        $total_sgst=0;
        $total_igst=0;

        $deleted_lineitem=[];
        foreach($order->lineitem as $existing_line) {
            array_push($deleted_lineitem,$existing_line->id);
        }
         // edit line items data

         if($igst) {
            foreach($input_array['lineitems'] as $lineitem) {
                $line = Lineitem::where('order_id',$id)->where('item_id',$lineitem['item_id'])->first();
                if($line) {
                    $removable_id=array_search($line->id,$deleted_lineitem,true);
                    array_splice($deleted_lineitem, $removable_id, 1);
                }
                else {
                    $line= new Lineitem();
                    $line->order_id=$order->id;
                    $line->item_id = $lineitem['item_id'];
                }
                
                $item= Item::find($lineitem['item_id']);
                $line->quantity = $lineitem['quantity'];
                $line->unit_price = $lineitem['unit_price'];
                $line_total=$lineitem['unit_price']*$lineitem['quantity'];
                $line_tax=$line_total * $item->product->tax_rate / (100+$item->product->tax_rate);
                $total_order_amount+= $line_total;
                $total_igst+=$line_tax;
                $line->save();
            }
         }
         else {
            foreach($input_array['lineitems'] as $lineitem) {
                $line = Lineitem::where('order_id',$id)->where('item_id',$lineitem['item_id'])->first();
                if($line) {
                    $removable_id=array_search($line->id,$deleted_lineitem,true);
                    array_splice($deleted_lineitem, $removable_id, 1);
                }
                else {
                    $line= new Lineitem();
                    $line->order_id=$order->id;
                    $line->item_id = $lineitem['item_id'];
                }
                
                $item= Item::find($lineitem['item_id']);
                $line->quantity = $lineitem['quantity'];
                $line->unit_price = $lineitem['unit_price'];
                $line_total=$lineitem['unit_price']*$lineitem['quantity'];
                $line_tax_cgst=$line_total * ($item->product->tax_rate/2) / (100+($item->product->tax_rate/2));
                $line_tax_sgst=$line_total * ($item->product->tax_rate/2) / (100+($item->product->tax_rate/2));
                $total_order_amount+= $line_total;
                $total_cgst+=$line_tax_cgst;
                $total_sgst+=$line_tax_sgst;
                $line->save();
            }

         }
        
         // add shipping amount to total amount 
         $total_order_amount+= isset($input_array['delivery_amount']) ? floatval($input_array['delivery_amount']) : 0;
         //Calculate GST 
         $order->sum_total= round($total_order_amount,2);
         $order->total_igst= round($total_igst,2);
         $order->total_cgst= round($total_cgst,2);
         $order->total_sgst= round($total_sgst,2);
         $order->save();
        // delete Lineitem that not present in the current list 
        Lineitem::whereIn('id',$deleted_lineitem)->delete();

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

    /**
     * Delete Order.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function TransactionDelete($id)
    {
        try {
        //$api_auth=App::make(ApiAuth::class);
        
        $order = Order::find($id);
        $order->delete();
        return response()->json(["status" => "success","message" => "Successfully Order Deleted"],200);

        }

    catch(\Exception $e) {
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
      }
    }



  
}
