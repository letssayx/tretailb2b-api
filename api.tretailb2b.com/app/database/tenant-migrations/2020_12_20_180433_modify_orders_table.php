<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::table('orders', function (Blueprint $table) {
            //
            $table->unsignedBigInteger('parent_order_id')->nullable();
            $table->foreign('parent_order_id')->references('id')->on('orders');
            $table->date('parent_reconcile_date')->nullable();
            $table->integer('child_depth')->nullable();
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
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('parent_order_id');
            $table->dropColumn('parent_reconcile_date');
            $table->dropColumn('child_depth');
        });
    }
}
