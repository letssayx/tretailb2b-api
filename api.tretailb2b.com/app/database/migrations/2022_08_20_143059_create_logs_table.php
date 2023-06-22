<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('queue_id')->unique()->nullable();
            $table->bigInteger('task_code')->nullable();
            $table->string('status')->default('pending');
            $table->json('description')->nullable();
            $table->string('topic')->default('default');
            $table->json('input_files')->nullable();
            $table->json('output_files')->nullable();
            $table->string('queue_id')->nullable()->change();
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
        Schema::dropIfExists('logs');
    }
}
