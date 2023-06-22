<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMetricsItemTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::table('items', function ($table) {
            //
            $table->string('dimension_unit')->default('cm');
            $table->string('weight_unit')->default('g');
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
        Schema::table('items', function ($table) {
            //
            $table->dropColumn('dimension_unit');
            $table->dropColumn('weight_unit');
        });
    }
}
