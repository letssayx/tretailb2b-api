<?php

namespace App\Http\Controllers\Store\Orders;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

use App;
use App\User;
use App\Helper\ApiAuth;
use App\Helper\GenerateOrderRef;
use App\Http\Middleware\TretailAuth;

use App\Store\Lineitem;
use App\Store\Customer;
use App\Store\Item;
use App\Store\LineitemChild;
use App\Store\ComboItems;
use App\Store\Order;

use Carbon\Carbon;
use \Firebase\JWT\JWT;

class OrderController extends Controller {

    /**
     * Get  Orders.
     *
     * @return \Illuminate\Http\JsonResponse
     */

    public function OrderList(Request $request) {
        try {
            //$api_auth = App::make(ApiAuth::class);
            $query = $request->all();
            $order_query = Order::query();
            $order_total_query = Order::query();

            if(isset($query['filter'])) {
                $filter=json_decode($query['filter'],true);
            }

            if(isset($query['range']))  {
                $range=json_decode($query['range'],true);
            }
            if(isset($query['sort'])) {
                $sort=json_decode($query['sort'],true);
            }

            if($filter['order_marketplace'] != 'all') {
                $order_query->where('sales_channel',  $filter['order_marketplace']); 
                $order_total_query->where('sales_channel',  $filter['order_marketplace']); 

            }
        
            switch ($filter['order_status']) {
                case 'shipped':
                    $order_query->where('status', 'shipped');
                    $order_total_query->where('status', 'shipped');
                    break;
                case 'cancelled':
                    $order_query->where('status', 'cancelled');
                    $order_total_query->where('status', 'cancelled');
                    break;
                case 'unshipped':
                    $order_query->where('status', 'unshipped');
                    $order_total_query->where('status', 'unshipped');
                    break;
            }

            switch ($filter['order_type']) {
                case 'b2b':
                    $order_query->where(function($query) {
                        $query->orWhere('total_igst', '>' ,  0.00)
                            ->orWhere('total_cgst', '>' ,  0.00)
                            ->orWhere('total_sgst', '>' ,  0.00);
                    });
                    $order_total_query->where(function($query) {
                        $query->orWhere('total_igst', '>' ,  0.00)
                            ->orWhere('total_cgst', '>' ,  0.00)
                            ->orWhere('total_sgst', '>' ,  0.00);
                    });
                    break;
                case 'b2c':
                    $order_query->where('total_igst','=', 0.00)
                        ->where('total_cgst','=', 0.00)
                        ->where('total_sgst','=',0.00);
                    $order_total_query->where('total_igst','=', 0.00)
                        ->where('total_cgst','=', 0.00)
                        ->where('total_sgst','=',0.00);
                    break;
            }
            // $total_data = Order::select(DB::raw('count(*) as total_count'))->first();
            $total_orders_count=0;
            $order_output=[];
            if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
                $sort_field = $sort[0];
                $sort_order = $sort[0]=="id"?'DESC':$sort[1];
            
                if(isset($filter['q']) && !empty($filter['q'])) {
                    $orders= $order_query->where('order_ref', 'like', '%'.$filter['q'].'%')->orWhere('marketplace_identifier','like','%'.$filter['q'].'%')->orderBy($sort_field, $sort_order)->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                    $orders_count= $order_total_query->where('order_ref', 'like', '%'.$filter['q'].'%')->orWhere('marketplace_identifier','like','%'.$filter['q'].'%')->orderBy($sort_field, $sort_order)->get();
                    $total_orders_count= $order_total_query->select(DB::raw('count(*) as total_count'))->where('order_ref', 'like', '%'.$filter['q'].'%')->orWhere('marketplace_identifier','like','%'.$filter['q'].'%')->first();
                } else {
                    $orders = $order_query->orderBy($sort_field, $sort_order)->offset($range[0])->limit(($range[1]-$range[0])+1)->get();
                    $orders_count = $order_total_query->orderBy($sort_field, $sort_order)->get();
                    $total_orders_count= $order_total_query->select(DB::raw('count(*) as total_count'))->first();
                    // return $total_orders_count;
                    // return (isset($total_orders_count->total_count) ? $total_orders_count->total_count : 0);
                } 
            } else {
                if(isset($filter['id']) && !empty($filter['id'])) {
                    $orders= $order_query->whereIn('id', $filter['id'])->orderBy('id','DESC')->get();
                    $total_orders_count= $order_query->select(DB::raw('count(*) as total_count'))->whereIn('id', $filter['id'])->first();
                } else {
                    $orders=$order_query->orderBy('id','DESC')->get();
                    $total_orders_count= $order_query->select(DB::raw('count(id) as total_count'))->first();
                }
            }
            foreach ($orders as $order) {
                $lineitems=[];
                foreach ($order->lineitem as $lineitem) {
                    $lineitem_childs=[];
                    $thumbnail_image=null;
                    $sku_name=null;
                    if($lineitem->item->product && $lineitem->item->inventory_type!='1') {
                        $pic_arr=json_decode($lineitem->item->product->pictures,true);
                        if(isset($pic_arr['images']) && count($pic_arr['images'])) {
                            $thumbnail_image ='https://storage.googleapis.com/'.$pic_arr['bucket'].'/'.$pic_arr['client'].'/'.$pic_arr['folder'].'/'.$pic_arr['images'][0]['thumbnail_image_name'];
                        } else {
                            $thumbnail_image ='https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png';
                        }
                        // $sku_name=$lineitem->item->sku."-".substr($lineitem->item->product->name,0,20);
                        $sku_name=$lineitem->item->sku;
                        $hsn_code=$lineitem->item->product->hsn_code;
                        $tax_rate=$lineitem->item->product->tax_rate;
                    } else {
                        $thumbnail_image='https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png';
                        $sku_name=$lineitem->item->sku.'-'.substr($lineitem->item->name,0,20);
                        $hsn_code=null;
                        $tax_rate=null;
                    }

                    foreach($lineitem->lineitem_childs as $single_child) {
                        $child_pic_arr=json_decode($single_child->item->product->pictures,true);
                        if(isset($child_pic_arr['images']) && count($child_pic_arr['images'])) {
                            $child_thumbnail_image ='https://storage.googleapis.com/'.$child_pic_arr['bucket'].'/'.$child_pic_arr['client'].'/'.$child_pic_arr['folder'].'/'.$child_pic_arr['images'][0]['thumbnail_image_name'];
                        } else {
                            $child_thumbnail_image ='https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png';
                        }
                        $child_sku_name=$single_child->item->sku."-".substr($single_child->item->product->name,0,20);
                        // $child_sku_name=$single_child->item->sku;
                        $child_hsn_code=$single_child->item->product->hsn_code;
                        $child_tax_rate=$single_child->item->product->tax_rate;
                        
                        array_push($lineitem_childs,array (
                            'item_id' => $single_child->item_id,
                            'item_sku_product' => $child_sku_name,
                            'quantity' => $single_child->quantity,
                            'unit_price' => $single_child->unit_price,
                            'order_item_id' => $single_child->order_item_id,
                            'hsn_code' => $child_hsn_code,
                            'tax_rate' => $child_tax_rate,
                            'thumbnail_image' => $child_thumbnail_image
                        ));                   
                    }

                    array_push($lineitems,array (
                        'item_id' => $lineitem->item_id,
                        'item_sku_product' => $sku_name,
                        'quantity' => $lineitem->quantity,
                        'unit_price' => $lineitem->unit_price,
                        'order_item_id' => $lineitem->order_item_id,
                        'hsn_code' => $hsn_code,
                        'tax_rate' => $tax_rate,
                        'combo_items'=>$lineitem_childs,
                        'thumbnail_image' => $thumbnail_image
                    ));
                }
                array_push($order_output,array(
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
                    'order_type'   => ( $order->total_igst > 0 || $order->total_cgst > 0 || $order->total_sgst > 0 )  ? "B2B" : "B2C",
                    'invoice_number' =>  $order->invoice_number,
                    // 'order_type' =>  $order->order_type,
                    'priority' =>  $order->priority==0?False:True,
                    'dispatch_by' =>  $order->dispatch_by,
                    'marketplace_identifier'=>$order->marketplace_identifier,
                    'marketplace_name' => $order->sales_channel,
                    'buyer_name'  => $order->buyer_name ,
                    'buyer_phone' => $order->buyer_phone,
                    'buyer_address'  => $order->buyer_address,
                    'buyer_city'     => $order->buyer_city,
                    'buyer_state'    => $order->buyer_state,
                    'buyer_pincode'  => $order->buyer_pincode ,
                    'billing_to_name'  => $order->billing_to_name ,
                    'billing_to_phone' => $order->billing_to_phone,
                    'billing_to_address'  => $order->billing_to_address,
                    'billing_to_city'     => $order->billing_to_city,
                    'billing_to_state'    => $order->billing_to_state,
                    'billing_to_pincode'  => $order->billing_to_pincode,
                    'updated_at' => $order->updated_at->setTimezone('Asia/Kolkata')->format('Y-m-d H:i:s'),
                ));
            }
            return response()->json($order_output)->header('X-Total-Count', isset($total_orders_count->total_count) ? $total_orders_count->total_count : 0);
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
    
    public function OrderCreate(Request $request) {
        $api_auth = App::make(ApiAuth::class);    
        DB::beginTransaction();
        try {
            $input_array = $request->json()->all();
            $validation = Validator::make($input_array, [
                'customer_id' => 'required',
                'order_date' => 'required',
                'status' => 'required',
                'lineitems.*.item_id' => 'required',
                'lineitems.*.quantity' => 'required|max:1',
                'lineitems.*.unit_price' => 'required',
            ]);
            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json($error_obj, 405);
            }

            $last_order= Order::where('order_ref','like','ORD%')->orderBy('id','desc')->first();
            $prefix="ORD";
            if(!$last_order){
                $order_ref = GenerateOrderRef::getInitialRef("ORD");
            } else {
                $order_ref = GenerateOrderRef::getRef($last_order->order_ref,"ORD");
            }
            
            //check item stock
            if(count($request->lineitems)!=0) {
                foreach($request->lineitems as $req_lineitem) {
                    $check_item= Item::find($req_lineitem['item_id']);
                    if($check_item->inventory_type=='1') {
                        $min_quantities=[];
                        foreach($check_item->combo_items as $combo_item){
                            $min_quantities[]=(int)($combo_item->child_item->quantity/$combo_item->quantity);
                        }
                        if($req_lineitem['quantity']>min($min_quantities)) return response()->json(['status'=>'fail','message'=>'Item is out of stock'],405);
                    }
                }
            }

            
            $customer= Customer::find($input_array['customer_id']);
            $seller_state = str_replace(' ','',strtoupper($api_auth->user()->client_details['state']));
            $buyer_state = str_replace(' ','',strtoupper($customer->state));
            $total_order_amount=0;
            $total_cgst=0;
            $total_sgst=0;
            $total_igst=0;
            $line_array=[];
            $combo_line_array=[];
            // Add line items data first & check stock
            foreach($input_array['lineitems'] as $lineitem) {
                $item= Item::find($lineitem['item_id']);
                //Check stock
                if($item->inventory_type=='1') {
                    $lineitem_childs=[];
                    $min_quantities=[];
                    foreach($item->combo_items as $combo_item)  {
                        $min_quantities[]=(int)($combo_item->child_item->quantity/$combo_item->quantity);
                    }
                    if(min($min_quantities)<$lineitem['quantity']) {
                        throw new \Exception("Stock is not available");
                    }
                    $line = new Lineitem();
                    $line->order_id=null;
                    $line->item_id = $lineitem['item_id'];
                    $line->quantity = $lineitem['quantity'];
                    $line->unit_price = $lineitem['unit_price'];
                    $line->order_item_id = round($lineitem['order_item_id']);
                    $line->tax = $lineitem['tax_rate'];
                    $line->discount = $lineitem['discount']/100;
                    $line->amount = $lineitem['amount'];
                    $item=Item::find($lineitem['item_id']);
                    if($item) {
                        $combo_item_tax_array=[];
                        foreach($item->combo_items as $combo_item)  {
                            $child_item=$combo_item->child_item;
                            $lineitem_child=new LineitemChild;                  
                            $lineitem_child->order_id=null;
                            $lineitem_child->item_id = $child_item->id;
                            $lineitem_child->quantity = $combo_item->quantity;
                            $lineitem_child->unit_price = $child_item->price;
                            // $combo_item->child_item->quantity-=$combo_item->quantity;
                            $combo_item->child_item->save();
                            // $line_total=$line->quantity*$child_item->price*$combo_item->quantity;
                            // $line_tax=$line_total - ($line_total * (100 / (100 + $child_item->product->tax_rate)));
                            // $total_order_amount+= $line_total;
                            // if($seller_state==$buyer_state) {
                            //     $total_cgst+=$line_tax/2;
                            //     $total_sgst+=$line_tax/2;
                            // }
                            // else {
                            //     $total_igst+=$line_tax;
                            // }
                            array_push($combo_item_tax_array,$child_item->product->tax_rate);
                            array_push($lineitem_childs,$lineitem_child);
                        } // End foreach
                        $combo_tax_rate=max($combo_item_tax_array);
                        $line_total=$lineitem['unit_price']*$lineitem['quantity'];
                        $line_tax=$line_total - ($line_total * (100 / (100 + $combo_tax_rate)));
                        $total_order_amount+= $line_total;
                        if($seller_state==$buyer_state) {
                            $total_cgst+=$line_tax/2;
                            $total_sgst+=$line_tax/2;
                        } else {
                            $total_igst+=$line_tax;
                        }
                    } // End if
                    // $line->save();
                    // $line->lineitem_childs()->saveMany($lineitem_childs);
                    array_push($combo_line_array,['parent'=>$line,'childs'=>$lineitem_childs]);
                } else {
                    if($item->quantity<$lineitem['quantity']) throw new \Exception("Stock is not available");
                    $line = new Lineitem();
                    $line->order_id=null;
                    $line->item_id = $lineitem['item_id'];
                    $line->quantity = $lineitem['quantity'];
                    $line->unit_price = $lineitem['unit_price'];
                    $line->order_item_id = round($lineitem['order_item_id']);
                    $line->tax = $lineitem['tax_rate'];
                    $line->discount = $lineitem['discount']/100;
                    $line->amount = $lineitem['amount'];
                    $line_total=$lineitem['unit_price']*$lineitem['quantity'];
                    $line_tax=$line_total - ($line_total * (100 / (100 + $item->product->tax_rate)));
                    $total_order_amount+= $line_total;
                    if($seller_state==$buyer_state) {
                        $total_cgst+=$line_tax/2;
                        $total_sgst+=$line_tax/2;
                    } else {
                        $total_igst+=$line_tax;
                    }
                    $line->save();
                    array_push($line_array,$line);
                }
            } // End foreach

            // add order data 
            $order= new Order;
            $order->customer_id= $input_array['customer_id'];
            $order->order_ref=$order_ref;
            $order->order_date= $input_array['order_date'];
            $order->delivery_amount= isset($input_array['delivery_amount']) ? $input_array['delivery_amount'] : 0;
            $order->sales_channel= $input_array['sales_channel'];
            $order->delivery_amount= isset($input_array['delivery_amount']) ? $input_array['delivery_amount'] : 0;
            $order->payments= isset($input_array['payments']) ? json_encode($input_array['payments']) : null;
            $order->priority= $input_array['priority'];
            $order->shipping= isset($input_array['shipping']) ? json_encode($input_array['shipping']) : null;
            $order->order_type= isset($input_array['order_type']) ? $input_array['order_type'] : null;
            $order->archive= isset($input_array['archive']) ? $input_array['archive'] : false;
            //$order->dispatch_by= isset($input_array['dispatch_by']) ? $input_array['dispatch_by'] : false;
            $order->status= $input_array['status'];

            $order->billing_to_name    = $input_array['billing_to_name'];
            $order->billing_to_phone   = $input_array['billing_to_phone'];
            $order->billing_to_address = $input_array['billing_to_address'];
            $order->billing_to_city    = $input_array['billing_to_city'];
            $order->billing_to_state   = $input_array['billing_to_state'];
            $order->billing_to_pincode = $input_array['billing_to_pincode'];

            $order->buyer_name    = $input_array['buyer_name'];
            $order->buyer_phone   = $input_array['buyer_phone'];
            $order->buyer_address = $input_array['buyer_address'];
            $order->buyer_city    = $input_array['buyer_city'];
            $order->buyer_state   = $input_array['buyer_state'];
            $order->buyer_pincode = $input_array['buyer_pincode'];
        
            // if($igst) {
            //     foreach($input_array['lineitems'] as $lineitem) {
            //         $item= Item::find($lineitem['item_id']);
            //         $line = new Lineitem();
            //         $line->order_id=$order->id;
            //         $line->item_id = $lineitem['item_id'];
            //         $line->quantity = $lineitem['quantity'];
            //         $line->unit_price = $lineitem['unit_price'];
            //         $line_total=$lineitem['unit_price']*$lineitem['quantity'];
            //         $line_tax=$line_total * $item->product->tax_rate / (100+$item->product->tax_rate);
            //         $total_order_amount+= $line_total;
            //         $total_igst+=$line_tax;
            //         $line->save();
            //     }
            // } else {
            //     foreach($input_array['lineitems'] as $lineitem) {
            //         $item= Item::find($lineitem['item_id']);
            //         $line = new Lineitem();
            //         $line->order_id=$order->id;
            //         $line->item_id = $lineitem['item_id'];
            //         $line->quantity = $lineitem['quantity'];
            //         $line->unit_price = $lineitem['unit_price'];
                        //         $line_total=$lineitem['unit_price']*$lineitem['quantity'];
            //         $line_tax_cgst=$line_total * ($item->product->tax_rate/2) / (100+($item->product->tax_rate/2));
            //         $line_tax_sgst=$line_total * ($item->product->tax_rate/2) / (100+($item->product->tax_rate/2));
            //         $total_order_amount+= $line_total;
            //         $total_cgst+=$line_tax_cgst;
            //         $total_sgst+=$line_tax_sgst;
            //         $line->save();
            //     }
            // }
       
            // add shipping amount to total amount (need to rethink how to represent delivery amount & discount)
            $total_order_amount+= isset($input_array['delivery_amount']) ? floatval($input_array['delivery_amount']) : 0;

            //Calculate GST 
            $order->sum_total= round($total_order_amount,2);
            $order->total_igst= round($total_igst,2);
            $order->total_cgst= round($total_cgst,2);
            $order->total_sgst= round($total_sgst,2);
            $order->save();
            // adjust stock & update lineitem with actual order id 

            foreach($line_array as $line) {
                // deduct stock 
                if(strtolower($order->status) !== 'cancelled'){
                    $line_qty =  $line->item->quantity - $line->quantity;
                    $line->item->updateQuantityWithLog( $line_qty , "Order create");
                    $line->item->inventory_updated_at=Carbon::now();
                    $line->item->save();
                }
                $line->order_id=$order->id;
                $line->save();
            }

            foreach($combo_line_array as $combo_line) {
                // deduct stock 
                // $line->item->quantity-=$line->quantity;
                // $combo_line['parent']->item->save();
                $combo_line['parent']->order_id=$order->id;
                $combo_line['parent']->save();
                foreach($combo_line['childs'] as $it) {
                    if(strtolower($order->status) !== 'cancelled'){
                        $child_line_qty = $it->item->quantity - ( $combo_line['parent']->quantity * $it->quantity );
                        $it->item->updateQuantityWithLog( $child_line_qty , "Order create");
                        $it->item->inventory_updated_at=Carbon::now();
                        $it->item->save();
                    }
                    $it->order_id=$order->id;
                    $it->lineitem_id=$combo_line['parent']->id;
                    $it->save();
                }
            }
            // Commit Transaction
            DB::commit();
            return response()->json(["status" => "success","message" => "Successfully Order Created","id" => $order->id],201);
        } catch(\Exception $e) {
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
    public function OrderShow($id) {
        try {
            //$api_auth=App::make(ApiAuth::class);
            $order=Order::find($id);
            $lineitems=[];
            foreach ($order->lineitem as $lineitem) {
               
                if($lineitem->item->inventory_type!='1') {
                    $pic_arr=json_decode($lineitem->item->product->pictures,true);
                    if(isset($pic_arr['images']) && count($pic_arr['images'])) {
                        $thumbnail_image ='https://storage.googleapis.com/'.$pic_arr['bucket'].'/'.$pic_arr['client'].'/'.$pic_arr['folder'].'/'.$pic_arr['images'][0]['thumbnail_image_name'];
                    } else {
                        $thumbnail_image ='https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png';
                    }
                    array_push($lineitems,array(
                        'item_id' => $lineitem->item_id,
                        'quantity' => $lineitem->quantity,
                        'unit_price' => $lineitem->unit_price,
                        'order_item_id' => $lineitem->order_item_id,
                        'hsn_code' => $lineitem->item->product->hsn_code,
                        'tax_rate' => $lineitem->item->product->tax_rate,
                        'thumbnail_image'=>$thumbnail_image,
                        'sku' => $lineitem->item->sku
                    ));
                } else {
                    $line_childs=[];
                    foreach($lineitem->lineitem_childs as $single_line_child){
                        $pic_arr=json_decode($single_line_child->item->product->pictures,true);
                        if(isset($pic_arr['images']) && count($pic_arr['images'])) {
                            $thumbnail_image ='https://storage.googleapis.com/'.$pic_arr['bucket'].'/'.$pic_arr['client'].'/'.$pic_arr['folder'].'/'.$pic_arr['images'][0]['thumbnail_image_name'];
                        } else {
                            $thumbnail_image ='https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png';
                        }
                        array_push($line_childs,array(
                            'item_id' => $single_line_child->item_id,
                            'quantity' => $single_line_child->quantity,
                            'unit_price' => $single_line_child->unit_price,
                            'order_item_id' => $single_line_child->order_item_id,
                            'hsn_code' => $single_line_child->item->product->hsn_code,
                            'tax_rate' => $single_line_child->item->product->tax_rate,
                            'sku'=>$single_line_child->item->sku,
                            'thumbnail_image'=>$thumbnail_image,
                        ));
                    }
                    array_push($lineitems,array(
                        'item_id' => $lineitem->item_id,
                        'quantity' => $lineitem->quantity,
                        'unit_price' => $lineitem->unit_price,
                        'order_item_id' => $lineitem->order_item_id,
                        'hsn_code' => null,
                        'tax_rate' =>null,
                        'combo_items'=>$line_childs
                    ));
                }
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

            $marketplace_status=null;
            if (count($order->order_tracks)!=0) {
                $marketplace_status_id=$order->order_tracks->last()->sub_status_position_id;
                if( strtolower($order->sales_channel)=='flipkart') {
                    $all_flipkart_status = env('FLIPKART_ORDER_STATUS');
                    if($all_flipkart_status) {
                        $all_flipkart_status=json_decode($all_flipkart_status);
                        foreach($all_flipkart_status as $fstatus) {
                            if($fstatus->id == $marketplace_status_id) {
                                $marketplace_status=$fstatus->status;
                            }
                        }
                    }
                } else if(strtolower($order->sales_channel)=='amazon') {
                    $all_amazon_status = env('AMAZON_ORDER_STATUS');
                    if($all_amazon_status){
                        $all_amazon_status=json_decode($all_amazon_status);
                        foreach( $all_amazon_status as $astatus) {
                            if($astatus->id == $marketplace_status_id) {
                                $marketplace_status=$astatus->status;
                            }
                        }
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
                'priority' => $order->priority,
                'dispatch_by' =>  $order->dispatch_by,
                'parent_order_details' => $parent_order_details,
                'marketplace_identifier'=>$order->marketplace_identifier,
                'marketplace_status'=> $marketplace_status ,
                'buyer_name'  => $order->buyer_name ,
                'buyer_phone' => $order->buyer_phone,
                'buyer_address'  => $order->buyer_address,
                'buyer_city'     => $order->buyer_city,
                'buyer_state'    => $order->buyer_state,
                'buyer_pincode'  => $order->buyer_pincode ,
                'billing_to_name'  => $order->billing_to_name ,
                'billing_to_phone' => $order->billing_to_phone,
                'billing_to_address'  => $order->billing_to_address,
                'billing_to_city'     => $order->billing_to_city,
                'billing_to_state'    => $order->billing_to_state,
                'billing_to_pincode'  => $order->billing_to_pincode
               ]);
        } catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }
    
    /**
    * Update Order.
    *
    * @return \Illuminate\Http\JsonResponse
    */
    public function OrderEdit(Request $request,$id) {
        $api_auth = App::make(ApiAuth::class);
        DB::beginTransaction();
        try {
            $input_array = $request->json()->all();
            // return response()->json(['status'=>'returned from Laravel','message'=>$input_array],200);

            $validation = Validator::make($input_array, [
                'customer_id' => 'required',
                'order_date' => 'required',
                'status' => 'required',
                'delivery_amount' => 'required',
                'lineitems.*.item_id' => 'required',
                'lineitems.*.quantity' => 'required|min:1',
                'lineitems.*.unit_price' => 'required',
            ]);

            if ($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => 'validation error');
                return response()->json($error_obj, 405);
            }

            $order= Order::find($id);
            if(isset($order->marketplace_identifier) && isset($order->marketplace_id)) {
                return response()->json(['status'=>'fail','message'=>"Can not update imported order"],405);
            }

            if(isset($order->status) && $order->status=='cancelled') {
                return response()->json(['status'=>'fail','message'=>"Can not update cancelled order"],405);
            }
            $prev_status = $order->status;

            // Check item stock
            if(count($request->lineitems)!=0) {
                foreach($request->lineitems as $req_lineitem) {
                    $check_item= Item::find($req_lineitem['item_id']);
                    $check_lineitem=Lineitem::where('order_id',$id)->where('item_id',$req_lineitem['item_id']);
                    if($check_item->inventory_type=='1') {
                        $min_quantities=[];
                        foreach($check_item->combo_items as $combo_item) {
                            $min_quantities[]=(int)($combo_item->child_item->quantity/$combo_item->quantity);
                        }
                        if($check_lineitem->count()==0) {
                            $check_qty=$req_lineitem['quantity'];
                        } else {
                            $check_qty=$req_lineitem['quantity']-$check_lineitem->first()->quantity;
                            if($check_qty>min($min_quantities)) {
                                return response()->json(['status'=>'fail','message'=>'Item is out of stock'],405);
                            }
                        }
                    }
                }
            }

            // Add data
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
            $order->dispatch_by= $input_array['dispatch_by'];
            $order->priority= $input_array['priority'];
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

            // Edit line items data
            foreach($input_array['lineitems'] as $lineitem) {
                $line = Lineitem::where('order_id',$id)->where('item_id',$lineitem['item_id'])->first();
                $is_new=false;
                $line_quantity=null;

                if($line) {
                    $removable_id = array_search($line->id,$deleted_lineitem,true);
                    array_splice( $deleted_lineitem, $removable_id, 1 );
                    $item_quantity = $lineitem['quantity'] - $line->quantity;
                } else {
                    $line = new Lineitem();
                    $line->order_id = $order->id;
                    $line->item_id  = $lineitem['item_id'];
                    $item_quantity  = $lineitem['quantity'];
                    $is_new = true;
                }

                $item= Item::find($lineitem['item_id']);

                if($item->inventory_type!='1') {
                    $line->quantity   = $lineitem['quantity'];
                    $line->unit_price = $lineitem['unit_price'];
                    $line_total = $lineitem['unit_price'] * $lineitem['quantity'];

                    if($igst) {
                        $line_tax=$line_total * $item->product->tax_rate / (100+$item->product->tax_rate);
                        $total_order_amount+= $line_total;
                        $total_igst+=$line_tax;
                    } else {
                        $line_tax_cgst=$line_total * ($item->product->tax_rate/2) / (100+($item->product->tax_rate/2));
                        $line_tax_sgst=$line_total * ($item->product->tax_rate/2) / (100+($item->product->tax_rate/2));
                        $total_order_amount+= $line_total;
                        $total_cgst+=$line_tax_cgst;
                        $total_sgst+=$line_tax_sgst;
                    }
                    $line->save();

                    // Item quantity deduction calculation and save
                    if ($input_array['status']=='cancelled' && $prev_status != $input_array['status']) {
                        if( !$is_new ){
                           $item->updateQuantityWithLog( $item->quantity + $line->quantity, "Order edit");
                           $item->inventory_updated_at = Carbon::now();
                        }
                    } else {
                        $item->updateQuantityWithLog( $item->quantity - $item_quantity, "Order edit");
                        if($item_quantity!=0) {
                            $item->inventory_updated_at=Carbon::now();
                        }
                    }
                    $item->save();
                } else {
                    if(!$is_new) {
                        $line->quantity = $lineitem['quantity'];
                        $line->unit_price = $lineitem['unit_price'];
                        $line->save();
                        $combo_item_tax_array=[];

                        foreach($line->lineitem_childs as $line_child) {
                            $single_combo_item = $item->combo_items()->where('child_item_id',$line_child->item_id)->first();
                            if ($input_array['status']=='cancelled' && $prev_status != $input_array['status']) {
                                $line_child->item->updateQuantityWithLog( $line_child->item->quantity - ( $single_combo_item->quantity * $line->quantity ), "Order edit");
                            }else{
                                $line_child->item->updateQuantityWithLog( $line_child->item->quantity - ( $single_combo_item->quantity * $item_quantity ), "Order edit");
                            }
                            if($item_quantity!=0) {
                                $line_child->item->inventory_updated_at=Carbon::now();
                            }
                            $line_child->item->save();
                            array_push($combo_item_tax_array,$line_child->item->product->tax_rate);
                        }
                        $combo_tax_rate=max($combo_item_tax_array);
                        $line_total=$line->quantity*$line->unit_price;
                        if($igst) {
                            $line_tax=$line_total * $combo_tax_rate / (100+$combo_tax_rate);
                            $total_order_amount+= $line_total;
                            $total_igst+=$line_tax;
                        } else {
                            $line_tax_cgst=$line_total * ($combo_tax_rate/2) / (100+($combo_tax_rate/2));
                            $line_tax_sgst=$line_total * ($combo_tax_rate/2) / (100+($combo_tax_rate/2));
                            $total_order_amount+= $line_total;
                            $total_cgst+=$line_tax_cgst;
                            $total_sgst+=$line_tax_sgst;
                        }
                    } else {
                        $line->quantity   = $lineitem['quantity'];
                        $line->unit_price = $lineitem['unit_price'];
                        $line->save();
                        $combo_item_tax_array=[];
                        foreach($item->combo_items as $combo_item) {
                            $child_item=$combo_item->child_item;
                            $line_child=new LineitemChild;                  
                            $line_child->order_id=$order->id;
                            $line_child->item_id = $child_item->id;
                            $line_child->quantity = $combo_item->quantity;
                            $line_child->unit_price = $child_item->price;
                            $line_child->lineitem_id=$line->id;
                            $line_child->save();
                            if ($input_array['status']=='cancelled' && $prev_status != $input_array['status']) {

                            }else{
                               $line_child->item->updateQuantityWithLog($line_child->item->quantity - ( $item_quantity * $line_child->quantity ), "Order edit");
                            }
                            $line_child->item->inventory_updated_at=Carbon::now();
                            $line_child->item->save();
                            array_push($combo_item_tax_array,$line_child->item->product->tax_rate);
                        } // End Foreach
                        $combo_tax_rate=max($combo_item_tax_array);
                        $line_total=$line->quantity*$line->unit_price;
                        if($igst) {
                            $line_tax=$line_total * $combo_tax_rate / (100+$combo_tax_rate);
                            $total_order_amount+= $line_total;
                            $total_igst+=$line_tax;
                        } else {
                            $line_tax_cgst=$line_total * ($combo_tax_rate/2) / (100+($combo_tax_rate/2));
                            $line_tax_sgst=$line_total * ($combo_tax_rate/2) / (100+($combo_tax_rate/2));
                            $total_order_amount+= $line_total;
                            $total_cgst+=$line_tax_cgst;
                            $total_sgst+=$line_tax_sgst;
                        }
                    } // End If-else
                } // End If-else
            } // End Foreach

            $order->billing_to_name    = $input_array['billing_to_name'];
            $order->billing_to_phone   = $input_array['billing_to_phone'];
            $order->billing_to_address = $input_array['billing_to_address'];
            $order->billing_to_city    = $input_array['billing_to_city'];
            $order->billing_to_state   = $input_array['billing_to_state'];
            $order->billing_to_pincode = $input_array['billing_to_pincode'];
    
            $order->buyer_name    = $input_array['buyer_name'];
            $order->buyer_phone   = $input_array['buyer_phone'];
            $order->buyer_address = $input_array['buyer_address'];
            $order->buyer_city    = $input_array['buyer_city'];
            $order->buyer_state   = $input_array['buyer_state'];
            $order->buyer_pincode = $input_array['buyer_pincode'];

            // Add shipping amount to total amount 
            $total_order_amount+= isset($input_array['delivery_amount']) ? floatval($input_array['delivery_amount']) : 0;
            //Calculate GST 
            $order->sum_total= round($total_order_amount,2);
            $order->total_igst= round($total_igst,2);
            $order->total_cgst= round($total_cgst,2);
            $order->total_sgst= round($total_sgst,2);
            $order->save();

            // delete Lineitem that not present in the current list 
            $lines_to_delete=Lineitem::whereIn('id',$deleted_lineitem);
            foreach($lines_to_delete->get() as $single_line){
                if($single_line->item->inventory_type!=0) {
                    foreach($single_line->lineitem_childs as $line_child) {
                        $related_combo_item=ComboItems::where('item_id',$line_child->line_item_id)->where('child_item_id',$line_child->item_id)->first();
                        $line_child->item->updateQuantityWithLog(($line_child->item->quantity + ( $line_child->quantity * $single_line->quantity )), "Order edit");
                        $line_child->item->save();
                        $line_child->delete();
                    }
                } else {
                    $single_line->item->updateQuantityWithLog( $single_line->item->quantity + $single_line->quantity, "Order edit");
                    $single_line->item->inventory_updated_at=Carbon::now();
                    $single_line->item->save();
                }
            }
            $lines_to_delete->delete();
            // Commit Transaction
            DB::commit();
            return response()->json(['status' => "success","message" => "Successfully Updated Order"],200);
        }  catch(\Exception $e) {
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
    public function OrderDelete($id) {
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

    public function MarketPlaces(Request $request){
        try {
            $query = Order::query();
            $marketplaces = $query
                ->select('sales_channel')
                ->groupBy('sales_channel')
                ->pluck('sales_channel');
            $success_obj = [ 
                'status'  => 'success' ,
                'message' => 'Successfully operation done' ,
                'data' => $marketplaces
            ];
            return response()->json( $success_obj, 200);
        } catch (\Exception $e) {
            $error_obj  = [
                'status'  => 'fail' ,
                'message' => $e->getMessage()
            ];
            return response()->json( $error_obj, 500);
        }
    }
}
