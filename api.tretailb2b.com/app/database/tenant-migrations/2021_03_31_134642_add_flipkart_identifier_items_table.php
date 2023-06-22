<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFlipkartIdentifierItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::table('items', function (Blueprint $table) {
            //
            $table->string('flipkart_listing_id')->nullable();
            $table->string('flipkart_product_id')->nullable();
            $table->boolean('flipkart_active_listing')->default(0);
            $table->float('flipkart_mrp',8,2)->nullable();
            $table->float('flipkart_selling_price',8,2)->nullable();
            $table->bigInteger('flipkart_quantity')->nullable();
            $table->timestamp('flipkart_last_sync_at', 0)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn('flipkart_listing_id');
            $table->dropColumn('flipkart_product_id');
            $table->dropColumn('flipkart_active_listing');
            $table->dropColumn('flipkart_mrp');
            $table->dropColumn('flipkart_selling_price');
            $table->dropColumn('flipkart_quantity');
            $table->dropColumn('flipkart_last_sync_at');
        });
    }
}
