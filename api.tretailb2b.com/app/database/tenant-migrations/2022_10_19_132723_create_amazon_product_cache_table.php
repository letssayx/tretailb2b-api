<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAmazonProductCacheTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('amazon_product_cache', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->string('amazon_listing_id')->nullable();
            $table->string('sku')->nullable();
            $table->string('asin');
            $table->string('status')->nullable();
            $table->timestamp('launch_date')->nullable();
            $table->unsignedInteger('quantity')->default(0);
            $table->float('price',8,2)->default(0.0);
            $table->float('mrp',8,2)->default(0.0);
            $table->longText('api_response')->nullable();
            $table->boolean('processed')->default(false);
            $table->unsignedBigInteger('log_id');
            $table->foreign('log_id')->references('id')->on('logs');
            $table->boolean('is_outside')->default( false );
            $table->string('product_type')->nullable();
            $table->string('relation')->nullable();
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
        Schema::dropIfExists('amazon_product_cache');
    }
}
