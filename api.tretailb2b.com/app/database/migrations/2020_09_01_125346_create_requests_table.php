<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRequestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->string('official_name');
            $table->longText('official_address')->nullable();
            $table->string('official_phone')->nullable();
            $table->string('official_email')->nullable();
            $table->string('state')->nullable();
            $table->string('gstin')->nullable();
            $table->string('email');
            $table->string('password')->nullable();
            $table->json('extra_information')->nullable();
            $table->string('validation_token')->nullable();
            $table->boolean('active')->default(0);
            $table->json('google_verification')->nullable();
            $table->timestamp('email_verified_at')->nullable();
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
        Schema::dropIfExists('requests');
    }
}
