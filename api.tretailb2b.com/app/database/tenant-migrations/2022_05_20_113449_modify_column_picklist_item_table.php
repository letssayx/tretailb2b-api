<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyColumnPicklistItemTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('picklist_items', function (Blueprint $table) {
            //
            $table->dropForeign(['lineitem_id']);
            $table->dropColumn('lineitem_id');
            $table->string('sku');
            $table->unsignedBigInteger('quantity');
            $table->string('bin')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('picklist_items', function (Blueprint $table) {
            $table->dropColumn(['sku', 'quantity', 'bin']);
            $table->unsignedBigInteger('lineitem_id')->unique();
            $table->foreign('lineitem_id')->references('id')->on('lineitems');
        });
    }
}
