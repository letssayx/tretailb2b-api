<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddOrderStatusIdentifierOrderTable extends Migration
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
            $table->Integer('status_position_id')->default(1); // set in env SYSTEM_ORDER_STATUS
            $table->timestamp('status_updated_at', 0)->nullable();
            $table->Integer('marketplace_id')->default(1); // 1 means store 
            $table->string('marketplace_identifier')->nullable();
            $table->unique(["marketplace_id", "marketplace_identifier"], 'marketplace_unique');

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
            $table->dropColumn('status_position_id');
            $table->dropColumn('status_updated_at');
            $table->dropUnique('marketplace_unique');
            $table->dropColumn('marketplace_id');
            $table->dropColumn('marketplace_identifier');
        });
    }
}
