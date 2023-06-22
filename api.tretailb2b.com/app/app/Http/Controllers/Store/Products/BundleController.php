<?php

namespace App\Http\Controllers\Store\Products;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Store\Item;
use App\Store\ComboItems;
use App\Store\Lineitem;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BundleController extends Controller
{
    //
    public function BundleList(Request $request){
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
            
            $total_combos_count=0;
            $combos=[];
            if(isset($range) && isset($sort) && count($range)==2 && count($sort)==2) {
                if(isset($filter['q']) && !empty($filter['q'])) {
                    $combos= Item::where('name', 'like', '%'.$filter['q'].'%')
                    ->where('inventory_type','1')
                    ->orderBy($sort[0], $sort[1])
                    ->offset($range[0])
                    ->limit(($range[1]-$range[0])+1)
                    ->get();

                    $total_combos_count = Item::select(DB::raw('count(*) as total_count'))
                    ->where('inventory_type','1')
                    ->where('name', 'like', '%'.$filter['q'].'%')->first();
                }
                else {
                    $combos= Item::where('inventory_type','1')
                    ->orderBy($sort[0], $sort[1])
                    ->offset($range[0])
                    ->limit(($range[1]-$range[0])+1)
                    ->get();
                    $total_combos_count= Item::select(DB::raw('count(*) as total_count'))
                    ->where('inventory_type','1')
                    ->first();
                }                 
            }
            else {
                $combos=Item::where('inventory_type','1')->get();
                $total_combos_count= Item::select(DB::raw('count(*) as total_count'))
                ->where('inventory_type','1')->first();
            }
            $combos_list=[];
            foreach($combos as $it){
               $combo_items=[];
               $min_quantities=[];
               $bundle_quantity=null;
               foreach($it->combo_items as $combo_item){
                   $thumbnail_image=null;
                   $pic_arr=json_decode($combo_item->child_item->product->pictures,true);
                   if(isset($pic_arr['images']) && count($pic_arr['images'])) {
                       $thumbnail_image ='https://storage.googleapis.com/'.$pic_arr['bucket'].'/'.$pic_arr['client'].'/'.$pic_arr['folder'].'/'.$pic_arr['images'][0]['thumbnail_image_name'];
                   }
                   else {
                       $thumbnail_image ='https://storage.googleapis.com/'.env('GCP_PRODUCTS_BUCKET').'/default/default-thumbnail.png';
                   }
                   $combo_items[]=[
                        'sku'=>$combo_item->child_item->sku,
                        'quantity'=>$combo_item->quantity,
                        'price'=>$combo_item->child_item->price,
                        'thumbnail_image'=>$thumbnail_image,
                   ];
                   $min_quantities[]=(int)($combo_item->child_item->quantity/$combo_item->quantity);
                   $bundle_quantity=min($min_quantities);
               }
               $combos_list[]=[
                   'id'=>$it->id,
                   'sku'=>$it->sku,
                   'items'=>$combo_items,
                   'quantity'=>$bundle_quantity,
                   'price'=>$it->price,
                   'name'=>$it->name,
                   'mrp'=>$it->mrp,
                 ];
            }
            return response()->json($combos_list)->header('X-Total-Count', isset($total_combos_count->total_count) ? $total_combos_count->total_count : 0);
        }
        catch(\Exception $e) {
                $error_obj=array('status'=>'fail','message'=> $e->getMessage());
                return response()->json($error_obj,400);
        }
    }

    public function BundleCreate(Request $request){
        try {
        $input_array = $request->json()->all();
        $rules= [
            'sku'         =>  'required|regex:/^\S+\w/|unique:items,sku|max:255',
            'items.*.sku' =>  'required|exists:items,sku|distinct',
            'items.*.quantity' =>  'required|numeric|gt:0',
            'price' =>  'required|regex:/^\d+(\.\d{1,2})?$/',
            'mrp' =>  'required|regex:/^\d+(\.\d{1,2})?$/|gt:price',
            'bundle_name' =>  'required',
        ];
        $validation = Validator::make($input_array,$rules);

        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors->first());
            return response()->json($error_obj, 405);
        }
        if(count($request->items)!=0){
            foreach($request->items as $req_item){
                $check_item = Item::where('sku',$req_item['sku'])->first();
                if ($req_item['quantity'] >  $check_item->quantity)
                return response()->json(['status' => 'fail', 'message' => 'Item is out of stock'],405);
            }
        }
        $child_sku_list=[];
        $child_qty_list=[];
        $combo_items=[];
        foreach($input_array['items'] as $it){
            array_push($child_sku_list,$it['sku']);
            $child_qty_list[$it['sku']]=$it['quantity'];
        }
        $child_items=Item::whereIn('sku',$child_sku_list)->get();
        foreach($child_items as $it){
            array_push( $combo_items ,
             new ComboItems([
                'quantity'=>$child_qty_list[$it->sku],
                'child_item_id'=>$it->id,
             ])
           );
        }
        $new_combo=new Item;
        $new_combo->sku=$input_array['sku'];
        $new_combo->inventory_type='1';
        $new_combo->product_id=null;
        $new_combo->mrp=$input_array['mrp'];
        $new_combo->price=$input_array['price'];
        $new_combo->name=$input_array['bundle_name'];
        $new_combo->active=$input_array['active'];
        $new_combo->dimentions='';
        $new_combo->weight='';
        $new_combo->quantity=0;
        $new_combo->save();
        $new_combo->combo_items()->saveMany($combo_items);
        return response()->json(["status" => "success","message" => "Successfully Bundle Created","id" => $new_combo->id],201);
    }
   catch(\Exception $e){
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
        
        }
    }

   public function BundleShow(Request $request,$id){
    try {
        $combo=Item::find($id);
        $combo_items=[];
        foreach($combo->combo_items as $combo_item){
            $combo_items[]=[
                 'id'=>$combo_item->child_item->id,
                 'sku'=>$combo_item->child_item->sku,
                 'quantity'=>$combo_item->quantity,
                 'price'=>$combo_item->child_item->price,
                 'hsn_code'=>$combo_item->child_item->product->hsn_code,
                 'tax_rate'=>$combo_item->child_item->product->tax_rate,
            ];
            $min_quantities[]=(int)($combo_item->child_item->quantity/$combo_item->quantity);
            $bundle_quantity=min($min_quantities);
        }
        return response()->json([
            'status'      => "success",
            'id'          => $combo->id,
            'bundle_name' => $combo->name,
            'sku'         => $combo->sku,
            'price'       => $combo->price,
            'mrp'         => $combo->mrp,
            'quantity'    => $combo->quantity,
            'active'      => $combo->active,
            'items'       => $combo_items,
        ]);
    }
   catch(\Exception $e){
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
        
        }

   }
   public function BundleEdit(Request $request,$id){
        try {
        DB::beginTransaction();
        $input_array = $request->json()->all();
        $validation = Validator::make($input_array, [
            'price' =>  'required|regex:/^\d+(\.\d{1,2})?$/',
            'mrp' =>  'required|regex:/^\d+(\.\d{1,2})?$/|gt:price',
            'bundle_name' =>  'required|min:5',
            'items.*.sku' =>  'required|exists:items,sku|distinct',
            'items.*.quantity' =>  'required|numeric|gt:0',
        ]);
        if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $errors->first());
            return response()->json($error_obj, 405);
        }
        if(count($request->items)!=0){
            foreach($request->items as $req_item){
                $check_item = Item::where('sku',$req_item['sku'])->first();
                if ($req_item['quantity'] >  $check_item->quantity)
                return response()->json(['status' => 'fail', 'message' => 'Item is out of stock'],405);
            }
        }
        $child_sku_list=[];
        $child_qty_list=[];
        $combo_items=[];
        
        foreach($input_array['items'] as $it){
            array_push($child_sku_list,$it['sku']);
            $child_qty_list[$it['sku']]=$it['quantity'];
        }
        $child_items=Item::whereIn('sku',$child_sku_list)->get();
        foreach($child_items as $it){
            array_push( $combo_items ,
             new ComboItems([
                'quantity'=>$child_qty_list[$it->sku],
                'child_item_id'=>$it->id,
             ])
           );
        }
        $new_combo=Item::find($id);
        if(Lineitem::where('item_id',$id)->get()->count()==0){
        $new_combo->sku=$input_array['sku'];
        $new_combo->inventory_type='1';
        $new_combo->product_id=null;
        $new_combo->mrp=$input_array['mrp'];
        $new_combo->price=$input_array['price'];
        $new_combo->name=$input_array['bundle_name'];
        $new_combo->active=$input_array['active'];
        $new_combo->dimentions='';
        $new_combo->weight='';
        $new_combo->quantity=0;
        $new_combo->save();
        $new_combo->combo_items()->delete();
        $new_combo->combo_items()->saveMany($combo_items);
        }else{
            $new_combo->mrp=$input_array['mrp'];
            $new_combo->price=$input_array['price'];
            $new_combo->active=$input_array['active'];
            $new_combo->save();
        }
        DB::commit();
        return response()->json(["status" => "success","message" => "Successfully Bundle Updated","id" => $new_combo->id],201);
    }
   catch(\Exception $e){
        DB::rollBack();
        $error_obj=array('status'=>'fail','message'=> $e->getMessage());
        return response()->json($error_obj,400);
        
        }
    }
    public function BundleItemShow(Request $request,$combo_id,$item_id){

        try {
            $combo=Item::find($combo_id);
            $item=Item::find($item_id);
            $combo_items=$combo->combo_items;
            if($combo_items->count()==0){
                return response()->json([
                'status'      => "success",
                'id'          => $item->id,
                'sku'         => $item->sku,
                'price'       => $item->price,
                'quantity'    => 0,
                'hsn_code'    => $item->product->hsn_code,
                'tax_rate'    => $item->product->tax_rate
               ]);
            }else{
                $combo_item_ids=$combo_items->pluck('child_item_id')->toArray();
                if(!in_array($item_id,$combo_item_ids)){
                    return response()->json([
                        'status'      => "success",
                        'id'          => $item->id,
                        'sku'         => $item->sku,
                        'price'       => $item->price,
                        'quantity'    => 0,
                        'hsn_code'    => $item->product->hsn_code,
                        'tax_rate'    => $item->product->tax_rate
                       ]);
                 }else{
                    $item_quantity=$combo->combo_items()->where('child_item_id',$item_id)->first()->quantity;
                    return response()->json([
                        'status'      => "success",
                        'id'          => $item->id,
                        'sku'         => $item->sku,
                        'price'       => $item->price,
                        'quantity'    => $item_quantity,
                        'hsn_code'    => $item->product->hsn_code,
                        'tax_rate'    => $item->product->tax_rate
                       ]);
                }
             }
           }
       catch(\Exception $e){
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
            
        }
      }
}
