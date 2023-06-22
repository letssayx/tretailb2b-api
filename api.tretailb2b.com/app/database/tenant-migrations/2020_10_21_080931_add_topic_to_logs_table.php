<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTopicToLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('logs', function (Blueprint $table) {
            //
            $table->string('topic')->default('default');
            $table->json('input_files')->nullable();
            $table->json('output_files')->nullable();
            $table->string('queue_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('logs', function (Blueprint $table) {
            //
            $table->dropColumn('topic');
            $table->dropColumn('input_files');
            $table->dropColumn('output_files');
            $table->string('queue_id')->nullable(false)->change();  
        });
    }
}
