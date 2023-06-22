<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class AddInventoryUpdateTrackingFieldsToItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('items', function (Blueprint $table) {
            //
            $current_datetime = Carbon::now()->format('Y-m-d H:i:s');
            $table->timestamp('amazon_qty_updated_at')->nullable()->default( $current_datetime );
            $table->timestamp('flipkart_qty_updated_at')->nullable()->default( $current_datetime );
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('items', function (Blueprint $table) {
            //
        });
    }
}
