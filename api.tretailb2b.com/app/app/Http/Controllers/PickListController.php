<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;

use App;
use App\Helper\ApiAuth;
use App\User;

use App\Store\Order;
use App\Store\PickList;
use App\Store\PickListItem;
use App\Store\Lineitem;
// use App\Http\Controllers\ExportCsv;

// use \ExportCsv;
use Carbon\Carbon;

class PickListController extends Controller {

    use \App\Http\Traits\ExportCsv;

    public function picklist(Request $request) {
        try {
            $picklist_array = [];
            $page = $request->page;
            $per_page = 200;
            $skip = ($page - 1) * $per_page;
            $picklist_query = PickList::query();
            $total_count = $picklist_query->count();
            $total_page = ceil($total_count / $per_page);
            if($total_count <= $per_page) {
                $page = 1;
            } else if($page > $total_page) {
                $page = $total_page;
            }
            $picklists = $picklist_query 
            ->skip( ($page - 1) * $per_page )
            ->limit( $per_page )
            ->orderBy( 'created_at','desc' )
            ->get();
            foreach($picklists as $sinlge_picklist) {
                $items  =  PickListItem::select( DB::raw('count(*) as count'))
                ->where('picklist_id', $sinlge_picklist->id)
                ->groupBy('sku')
                ->get();
                array_push($picklist_array,[
                    'data'=> [
                        'id'         => $sinlge_picklist->id,
                        'name'       => $sinlge_picklist->name,
                        'item_count' => count( $items ),
                        'status'     => $sinlge_picklist->status ,
                        'created_at' => $sinlge_picklist->updated_at
                    ]
                ]);
            }
            return response()->json([
                'data' => $picklist_array, 
                'pagination' => compact("page","per_page","total_count","total_page")
            ]);
        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    public function GetItems(Request $request, $id) {
        try {
            $picklist_item_array = [];
            $page = $request->page;
            $per_page = 200;
            $skip = ($page - 1) * $per_page;
            $picklist_item_query = PickList::find($id)->items();
            $total_count = $picklist_item_query->count();
            $total_page = ceil($total_count / $per_page);
            if($total_count <= $per_page) {
                $page = 1;
            } else if($page > $total_page) {
                $page = $total_page;
            }
            $picklist_items = $picklist_item_query
            ->select( DB::raw( 'sum(quantity) as quantity, sku, bin, status') )
            ->groupBy('sku')
            ->groupBy('status')
            ->groupBy('bin')
            ->orderBy('bin', 'asc') 
            ->skip( ($page - 1) * $per_page )
            ->limit( $per_page )
            ->get();
            foreach($picklist_items as $item) {
                array_push($picklist_item_array ,[
                    'data'=> [
                        'id'         =>  $item->sku,
                        'sku'        =>  $item->sku,
                        'quantity'   =>  $item->quantity,
                        'bin'        =>  $item->bin,
                        'status'     =>  $item->status
                    ]
                ]);
            }
            return response()->json([
                'data' => $picklist_item_array, 
                'pagination' => compact("page","per_page","total_count","total_page")
            ]);
        } catch (\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    public function SelectItems(Request $request) {
        try {
            $marketplaces = Order::query()
            ->select('sales_channel')
            ->groupBy('sales_channel')
            ->pluck('sales_channel')
            ->toArray();
            $data_list = [];
            $rules = [
                'dispatch_by_filter' => [
                    'required',
                    Rule::in(['lastweek','yesterday','today', 'tomorrow', 'dayaftertomorrow',  'thisweek', 'thismonth']),  
                    // Rule::in(['today', 'yesterday', '15_days',  '30_days', '45_days','60_days','90_days']),  
                ],
                'order_item' => [
                    'required',
                    Rule::in(['both', 'single', 'multi'])  
                ],
                'order_marketplace' => [
                    'required',
                    Rule::in( array_merge( $marketplaces, ['all','Myntra',"AJIOB2C"]) )
                ],
                'order_type' => [
                    'required',
                    Rule::in(['both', 'b2b', 'b2c'])  
                ],
                'order_status'=> [
                    'required',
                    // Rule::in(['ordered','shipped','completed','returned','cancelled','processed','unassigned','unshipped'])
                    Rule::in(['unassigned','unshipped','ordered'])
                ]
            ];
            $validator = Validator::make($request->all(), $rules);
            if($validator->fails()) {
                $errors = $validator->errors();
                $error_obj = array('status' => 'fail', 'message' => $validator->errors()->first());
                return response()->json($error_obj,400);
            }
            $order_query = Order::query();
            $current_date = Carbon::today();
            $page = $request->page;
            $per_page = 200;
            $skip = ($page - 1) * $per_page;
            switch ($request->dispatch_by_filter) {
                case 'lastweek':
                    $start_of_week = Carbon::parse(Carbon::today()->startOfWeek())->format('Y-m-d');                    
                    $order_query->whereBetween('dispatch_by', [ $start_of_week, Carbon::parse($current_date)->format('Y-m-d') ]);
                    break;
                case 'yesterday':
                    $dispatch_by_date = $current_date->subDays(1)->format('Y-m-d');
                    $order_query->whereDate('dispatch_by', '=', $dispatch_by_date);
                    break;
                case 'today':
                    $dispatch_by_date = $current_date->format('Y-m-d');
                    $order_query->whereDate('dispatch_by','=', $dispatch_by_date);
                    break;
                case 'tomorrow':
                    $dispatch_by_date = $current_date->addDays(1)->format('Y-m-d');
                    $order_query->whereDate('dispatch_by', '=', $dispatch_by_date);
                    break;
                case 'dayaftertomorrow':
                    $dispatch_by_date = $current_date->addDays(2)->format('Y-m-d');
                    $order_query->whereDate('dispatch_by', '=',$dispatch_by_date);
                    break;
                case 'thisweek':
                    $end_of_week = Carbon::parse(Carbon::today()->endOfWeek())->format('Y-m-d');
                    $order_query->whereBetween('dispatch_by', [ Carbon::parse($current_date)->format('Y-m-d'), $end_of_week ]);
                    break;
                case 'thismonth':
                    $end_of_month = Carbon::parse(Carbon::today()->endOfMonth())->format('Y-m-d');
                    $order_query->whereBetween('dispatch_by', [ Carbon::parse($current_date)->format('Y-m-d'), $end_of_month ]);
                    break;
            }
            if($request->order_marketplace != 'all') {
                $order_query->where('sales_channel',  $request->order_marketplace); 
            }
            switch ($request->order_status) {
                case 'unassigned':
                    $order_query->where('status',  'unassigned');
                    break;
                case 'unshipped':
                    $order_query->where('status', 'unshipped');
                    break;
                case 'ordered':
                    $order_query->where('status',  'ordered');
                    break;
            }
            switch ($request->order_type) {
                case 'b2b':
                    $order_query->where(function($query) {
                        $query->orWhere('total_igst', '>' ,  0.00)
                            ->orWhere('total_cgst', '>' ,  0.00)
                            ->orWhere('total_sgst', '>' ,  0.00);
                    });
                    break;
                case 'b2c':
                    $order_query->where('total_igst','=', 0.00)
                            ->where('total_cgst','=', 0.00)
                            ->where('total_sgst','=',0.00);
                    break;
            }
            switch ( $request->order_item ) {
                case 'single':
                    $order_query->where(function($query) {
                        $query->select(DB::raw('count(*) as total_count'))
                            ->from('lineitems')
                            ->whereColumn('order_id','orders.id');  
                    }, '=', 1);
                    break;
                case 'multi':
                    $order_query->where(function($query){
                        $query->select(DB::raw('count(*) as total_count'))
                            ->from('lineitems')
                            ->whereColumn('order_id','orders.id');  
                    }, '>', 1);
                    break;
            }
            $order_query->where(function( $query1 ) {
                $query1->select(DB::raw('count(*) as total_count'))
                    ->from('lineitems')
                    ->whereColumn('order_id','orders.id')
                    ->whereExists(function($query2){
                $query2->select(DB::raw(1))
                    ->from('picklist_items')
                    ->whereRaw('lineitem_id = lineitems.id');
                });
            },'<>',function($query3) {
                $query3
                    ->select(DB::raw('count(*) as total_count'))
                    ->from('lineitems')
                    ->whereColumn('order_id','orders.id');  
            });

            $total_count = $order_query->count();
            $total_page = ceil($total_count / $per_page);
            if($total_count <= $per_page) {
                $page = 1;
            } else if($page > $total_page) {
                $page = $total_page;
            }
            $total_item_count = 0;
            if( !$request->has('export_csv') ) {
                $orders = $order_query->skip( ($page - 1) * $per_page )
                    ->limit( $per_page )
                    ->get();
                // $total_count = $total_item_count;
                foreach($orders as $single_order) {
                    $lineitem_array = [];
                    $marketplace_id = $single_order->marketplace_identifier? $single_order->marketplace_identifier: '';
                    $lineitems = $single_order->lineitem()
                        ->whereNotExists(function($query) {
                            $query->select(DB::raw(1))
                                ->from('picklist_items')
                                ->whereRaw('lineitem_id = lineitems.id');
                        })
                        ->get();
                        $total_item_count += count($lineitems);
                        foreach($lineitems as $single_lineitem) {
                            array_push($lineitem_array, [
                                'data' => [
                                    'sku'       => $single_lineitem->item->sku,
                                    'quantity'  => $single_lineitem->quantity, 
                                    'id'        => $single_lineitem->id
                                ]
                            ]);
                        }
                        array_push( $data_list ,[ 
                            'data' => [
                                'order_ref'     => $single_order->order_ref,
                                'order_date'    => $single_order->order_date,
                                'quantity'      => count($lineitems),
                                'status'        => $single_order->status,
                                'dispatch_by'   => $single_order->dispatch_by,
                                'marketplace_id'=> $marketplace_id,
                                'sales_channel' => ($single_order->sales_channel? $single_order->sales_channel: 'None'),
                            ],
                            'childRows' => $lineitem_array,
                        ]
                    );
                }
                return response()->json([
                    'data'          =>  $data_list, 
                    'pagination'    =>  compact("page","per_page","total_count","total_page"),
                ]);
            } else if($request->has('export_csv') && $request->export_csv == true) {
                $orders = $order_query->get();
                // export csv file code 
                $file_rows = [];
                $filename = 'picklist_order.csv';
                $file_columns= array('order_ref', 'order_date', 'quantity', 'status',
                            'dispatch_by', 'marketplace_id', 'sales_channel', 'childRows');
                $file_rows[] = $file_columns;
                foreach($orders as $single_order) {
                    $lineitems = $single_order->lineitem()
                        ->whereNotExists(function($query) {
                            $query->select(DB::raw(1))
                                ->from('picklist_items')
                                ->whereRaw('lineitem_id = lineitems.id');
                        })
                        ->get();
                    $lineitem_array = [];
                    $total_item_count += count($lineitems);
                    foreach($lineitems as $single_lineitem) {
                        array_push($lineitem_array, [
                            'data' => [
                                'sku'        => $single_lineitem->item->sku,
                                'quantity'   => $single_lineitem->quantity, 
                                'unit_price' => $single_lineitem->unit_price
                            ]
                        ]);
                    }
                    foreach($lineitem_array as $line) {
                        $line_data = $line;
                    }
                    $marketplace_id = $single_order->marketplace_identifier? $single_order->marketplace_identifier: '';
                    $file_row['order_ref']      = $single_order->order_ref;
                    $file_row['order_date']     = $single_order->order_date;
                    $file_row['quantity']       = count($lineitems);
                    $file_row['status']         = $single_order->status;
                    $file_row['dispatch_by']    = $single_order->dispatch_by;
                    $file_row['marketplace_id'] = $marketplace_id;
                    $file_row['sales_channel']  = ($single_order->sales_channel? $single_order->sales_channel: 'None');
                    $file_row['childRows']      = json_encode($line);
                    $file_rows[] = $file_row;
                }
                return $this->file_export($filename,$file_rows);
            }
        } catch(Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    public function create(Request $request){
        try {
            $rules = [
                'lineitems.*.id' => 'required|exists:lineitems,id',
                'lineitems.*.sku' => 'required|exists:items,sku',
            ];
            $validation = Validator::make($request->all(), $rules);
            if($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => $validation->errors()->first());
                return response()->json($error_obj);
            }
            DB::beginTransaction();
            $current_date = Carbon::now();
            $current_date->format('dmY');
            $picklist = new PickList();
            $last_picklist = PickList::orderBy('id','desc')->first();
            $prefix = "PKID-";
            $api_auth = App::make(ApiAuth::class);    
            $user_details =  $api_auth->user();
            $username = DB::connection('mysql-src')->select("select name from users where id = $user_details->user_id");
            if(empty($last_picklist)) {
                $picklist->name = $prefix . $username[0]->name ."-". $this->addLeadingZeros(1) ."-". $current_date->format('dmY-His');
            } else {
                $serial_no = substr( str_replace($prefix,"", $last_picklist->name),0 , 4);
                $is_same_date = substr( str_replace($prefix,"", $last_picklist->name), 4, 8) == $current_date->format('dmY')? true: false;
                $picklist->name = $prefix . $username[0]->name ."-". $this->addLeadingZeros(( $is_same_date? 1 + (int)$serial_no: 1 )) ."-". $current_date->format('dmY-His');
            }
            $picklist->save();
            $ids = array_filter( array_column($request->lineitems,'id') );
            $lineitems = Lineitem::whereIn('id', $ids)->get();
            $item_array = [];
            foreach($lineitems as $single_lineitem) {
                $single_item                =  $single_lineitem->item;
                $picklist_item              =  new PickListItem();
                $picklist_item->quantity    =  $single_lineitem->quantity;
                $picklist_item->sku         =  $single_item->sku;
                $picklist_item->bin         =  $single_item->inventory_location;
                $picklist_item->lineitem_id =  $single_lineitem->id;
                array_push($item_array, $picklist_item);
            }
            $picklist->items()->saveMany( $item_array );
            DB::commit();
            return response()->json(["status" => "success","message" => "Picklist Created Successfully"],200);
        } catch (\Exception $e) {
            DB::rollBack();
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    public function process(Request $request){
        try {
            if($request->type && in_array($request->type,['picklist' , 'item'])) {
                // Do Nothing
            } else {
                $error_obj = array('status' => 'fail', 'message' => 'invalid type');
                return response()->json($error_obj);
            }
            if($request->type == 'item') {
                $rules = [
                    'ids.*' => 'required|exists:picklist_items,sku'
                ];
            } else if($request->type == 'picklist') {
                $rules = [
                    'ids.*' => 'required|exists:picklists,id'
                ];
            }
            $validation = Validator::make($request->all(), $rules);
            if($validation->fails()) {
                $errors = $validation->errors();
                $error_obj = array('status' => 'fail', 'message' => $validation->errors()->first());
                return response()->json($error_obj);
            }
            DB::beginTransaction();
            if($request->type == 'item') {
                $query = PickListItem::query();
                $query->whereIn('sku',$request->ids)->update(['status'=>'processed']);
                foreach ($query->get() as $item) {
                    $processed_items = $item->picklist->items()->where('status','processed')->get();
                    if(count($item->picklist->items) === count($processed_items)) {
                        $item->picklist->status = 'processed';
                        $item->picklist->save();
                    }
                }
            } else if($request->type == 'picklist') {
                $query = PickList::whereIn('id',$request->ids);
                foreach ($query->get() as $single_picklist) {
                    $single_picklist->items()->update(['status'=>'processed']);
                }
                $query->update(['status'=>'processed']);
            }
            $query->whereIn('id',$request->ids)->update(['status'=>'processed']);
            DB::commit();
            return response()->json(["status" => "success","message" => "updated successfully"],200);
        } catch (\Exception $e) {
            DB::rollBack();
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }
    }

    public function addLeadingZeros($number) {
        $length = 4;
        $string = substr(str_repeat(0, $length).$number, - $length);
        return $string;
    }
}
