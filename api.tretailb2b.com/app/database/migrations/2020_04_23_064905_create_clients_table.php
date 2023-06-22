<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClientsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->longText('address');
            $table->string('phone');
            $table->string('email');
            // $table->string('db_host')->default('mysql-db');
            $table->string('db_host')->default(env("DB_HOST", "127.0.0.1"));
            $table->string('db_name');
            $table->string('db_port')->default(env("DB_PORT", "3306"));
            $table->string('db_user');
            $table->string('db_pass');
            $table->boolean('db_ssl')->default(0);
            $table->string('db_ssl_ca')->nullable();
            $table->boolean('active')->default(0);
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
        Schema::dropIfExists('clients');
    }
}
