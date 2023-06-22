<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBillingToFieldsToOrdersTable extends Migration
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
            $table->string('billing_to_name')->nullable();
            $table->string('billing_to_phone')->nullable();
            $table->string('billing_to_address')->nullable();
            $table->string('billing_to_city')->nullable();
            $table->string('billing_to_state')->nullable();
            $table->string('billing_to_pincode')->nullable();
            $table->string('buyer_city')->after('buyer_address')->nullable();
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
            $table->dropColumn([
                'billing_to_name',
                'billing_to_phone',
                'billing_to_address',
                'billing_to_city',
                'billing_to_state',
                'billing_to_pincode',
                'buyer_city'
            ]);
        });
    }
}
