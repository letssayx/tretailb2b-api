<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBundlesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('combo_items',function(Blueprint $table){
            $table->id();
            $table->unsignedBigInteger('item_id');
            $table->unsignedBigInteger('child_item_id');
            $table->unsignedBigInteger('quantity');
            $table->foreign('item_id')->references('id')->on('items');
            $table->foreign('child_item_id')->references('id')->on('items');
            $table->timestamps();
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
        Schema::dropIfExists('combo_items');
    }
}
