<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->foreign('order_id')->references('id')->on('orders');
            $table->unsignedBigInteger('lineitem_id')->nullable();
            $table->foreign('lineitem_id')->references('id')->on('lineitems');
            $table->unsignedBigInteger('settlement_id')->nullable();
            $table->boolean('is_debit')->default(0);
            $table->float('sum_total', 8, 2);
            $table->float('total_igst', 8, 2)->default(0);
            $table->float('total_cgst', 8, 2)->default(0);
            $table->float('total_sgst', 8, 2)->default(0);
            $table->string('service_type')->nullable();
            $table->date('initiate_date')->nullable();
            $table->string('notes')->nullable();
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
        Schema::dropIfExists('transactions');
    }
}
