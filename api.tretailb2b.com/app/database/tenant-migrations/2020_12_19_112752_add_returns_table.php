<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddReturnsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('order_returns', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->foreign('order_id')->references('id')->on('orders');
            $table->unsignedBigInteger('lineitem_id')->nullable();
            $table->foreign('lineitem_id')->references('id')->on('lineitems');
            $table->bigInteger('quantity');
            $table->date('initiate_date')->nullable();
            $table->date('received_date')->nullable();
            $table->string('reason')->nullable();
            $table->string('type')->nullable();
            $table->boolean('is_received')->default(0);
            $table->boolean('is_good_inventory')->default(0);
            $table->boolean('is_inventory_adjusted')->default(0);
            $table->date('inventory_adjusted_date')->nullable();
            $table->boolean('archive')->default(0);
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
        Schema::dropIfExists('order_returns');
    }
}
