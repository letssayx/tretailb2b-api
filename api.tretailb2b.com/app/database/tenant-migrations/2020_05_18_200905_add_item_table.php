<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddItemTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->foreign('product_id')->references('id')->on('products');
            $table->string('sku')->unique();
            $table->float('mrp',8,2);
            $table->float('price',8,2);
            $table->string('dimentions');
            $table->string('weight');
            $table->unsignedBigInteger('quantity');
            $table->json('variants')->nullable();
            $table->json('attributes')->nullable();
            $table->boolean('active')->default(0);
            $table->boolean('sync_amazon')->default(0);
            $table->boolean('sync_flipcart')->default(0);
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
        Schema::dropIfExists('items');
    }
}
