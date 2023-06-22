<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLineitemIdColumnToPicklistItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('picklist_items', function (Blueprint $table) {
            //added a foreign key column lineitem_id
            $table->unsignedBigInteger('lineitem_id')->nullable()->unique();
            $table->foreign('lineitem_id')->references('id')->on('lineitems');

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
            
            $table->dropForeign(['lineitem_id']);
            $table->dropColumn('lineitem_id');

        });
    }
}
