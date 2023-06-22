<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
class AddUndefinedItemToTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('table', function (Blueprint $table) {
            //
            $brand_id=DB::table('brands')->insertGetId([
            'name'=>'undefined', 
            'created_at'=>date('Y-m-d H:i:s'), 
            'updated_at' =>date('Y-m-d H:i:s'),
            ]);
            $category_id=DB::table('categories')->insertGetId([
             'name'=>'undefined', 
             'parent_category_id'=>null, 
             'amazon_field_mapping'=>null, 
             'flipcart_field_mapping'=>null, 
             'created_at'=>date('Y-m-d H:i:s'), 
             'updated_at'=>date('Y-m-d H:i:s')
            ]);
            $sub_category_id=DB::table('categories')->insertGetId([
                'name'=>'undefined', 
                'parent_category_id'=>$category_id, 
                'amazon_field_mapping'=>null, 
                'flipcart_field_mapping'=>null, 
                'created_at'=>date('Y-m-d H:i:s'), 
                'updated_at'=>date('Y-m-d H:i:s')
            ]);
            $manufacturer_id=DB::table('manufacturers')->insertGetId([
                'name'=>'undefined', 
                'created_at'=>date('Y-m-d H:i:s'), 
                'updated_at'=>date('Y-m-d H:i:s'),
            ]);
            $country_id=DB::table('countries')->insertGetId([
                'name'=>'undefined', 
                'created_at'=>date('Y-m-d H:i:s'), 
                'updated_at'=>date('Y-m-d H:i:s'),
            ]);
            $product_id=DB::table('products')->insertGetId([
              'name'=>'undefined', 
              'description'=>'undefined', 
              'asin'=>'undefined', 
              'sku'=>'undefined', 
              'brand_id'=>$brand_id, 
              'category_id'=>$sub_category_id, 
              'launch_date'=>date('Y-m-d H:i:s'), 
              'active'=>0, 
              'created_at'=>date('Y-m-d H:i:s'), 
              'updated_at'=>date('Y-m-d H:i:s'), 
              'pictures'=>null, 
              'hsn_code'=>0, 
              'tax_rate'=>0.00, 
              'manufacturer_id'=>$manufacturer_id, 
              'country_id'=>$country_id, 
              'amazon_listing_id'=>null
            ]);
            DB::table('items')->insert([
              'product_id'=>$product_id, 
              'sku'=>'undefined', 
              'mrp'=>0.00, 
              'price'=>0.00,
              'dimentions'=>'0*0',
              'weight'=>'',
              'quantity'=>0,
              'variants'=>null,
              'attributes'=>null,
              'active'=>0,
              'sync_amazon'=>0, 
              'sync_flipcart'=>0, 
              'created_at'=>date('Y-m-d H:i:s'), 
              'updated_at'=>date('Y-m-d H:i:s'), 
              'dimension_unit'=>'', 
              'weight_unit'=>'', 
              'asin'=>'undefined', 
              'amazon_listing_id'=>null, 
              'inventory_location'=>null, 
              'flipkart_listing_id'=>null, 
              'flipkart_product_id'=>null, 
              'flipkart_active_listing'=>0, 
              'flipkart_mrp'=>null, 
              'flipkart_selling_price'=>null, 
              'flipkart_quantity'=>null, 
              'flipkart_last_sync_at'=>null, 
              'inventory_type'=>'0', 
              'name'=>null,
            ]);


        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('table', function (Blueprint $table) {
            //
        });
    }
}
