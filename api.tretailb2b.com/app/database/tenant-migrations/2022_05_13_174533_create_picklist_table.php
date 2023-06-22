<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePicklistTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('picklists', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('ship_date')->nullable();
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
        Schema::dropIfExists('picklists');
    }
}
