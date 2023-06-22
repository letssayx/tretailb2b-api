<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePicklistItemTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('picklist_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('picklist_id');
            $table->foreign('picklist_id')->references('id')->on('picklists');
            $table->unsignedBigInteger('lineitem_id')->unique();
            $table->foreign('lineitem_id')->references('id')->on('lineitems');
            $table->string('status')->default('unprocessed')->nullable();
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
        Schema::dropIfExists('picklist_items');
    }
}
