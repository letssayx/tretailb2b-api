<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifiedCustomerTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::table('customers', function (Blueprint $table) {
            //
            $table->dropUnique(['email']);
            $table->string('email')->nullable()->change();
            $table->string('phone')->nullable()->unique()->change();
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
        Schema::table('customers', function (Blueprint $table) {
            //
            $table->string('email')->nullable(false)->unique()->change();
            $table->string('phone')->nullable()->dropUnique()->change();
        });
    }
}
