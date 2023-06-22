<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifiedAmazonfieldItemTable extends Migration
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
            $table->string('asin')->nullable();
            $table->string('amazon_listing_id')->nullable();
            $table->string('inventory_location')->nullable();
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
            //
            $table->dropColumn('asin');
            $table->dropColumn('amazon_listing_id');
            $table->dropColumn('inventory_location');
        });
    }
}
