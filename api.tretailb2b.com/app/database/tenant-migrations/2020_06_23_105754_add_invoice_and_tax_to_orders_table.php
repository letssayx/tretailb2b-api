<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddInvoiceAndTaxToOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            //
            $table->float('total_igst', 8, 2)->default(0);
            $table->float('total_cgst', 8, 2)->default(0);
            $table->float('total_sgst', 8, 2)->default(0);
            $table->float('sum_total', 8, 2)->default(0);
            $table->dateTime('order_date', 0)->change();
            $table->string('invoice_number')->nullable();
            $table->string('order_type')->nullable();
            $table->dateTime('dispatch_by', 0)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            //
            $table->dropColumn('total_igst');
            $table->dropColumn('total_cgst');
            $table->dropColumn('total_sgst');
            $table->dropColumn('invoice_number');
            $table->dropColumn('order_type');
            $table->dropColumn('dispatch_by');
            $table->date('order_date')->change();
        });
    }
}
