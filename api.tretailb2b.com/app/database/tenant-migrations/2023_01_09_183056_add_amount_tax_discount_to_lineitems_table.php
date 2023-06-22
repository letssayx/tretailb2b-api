<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAmountTaxDiscountToLineitemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('lineitems', function (Blueprint $table) {
            $table->float('discount', 8, 2)->default(00.0);
            $table->float('amount', 8, 2)->default(00.0);
            $table->float('tax', 8, 2)->default(00.0);

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lineitems', function (Blueprint $table) {
            //
        });
    }
}
