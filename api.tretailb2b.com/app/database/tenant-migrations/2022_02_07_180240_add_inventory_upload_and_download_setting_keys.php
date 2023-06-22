<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
class AddInventoryUploadAndDownloadSettingKeys extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        DB::table("settings")->updateOrInsert(["key"=>"is_inventory_downloaded","value"=>"0"]);
        DB::table("settings")->updateOrInsert(["key"=>"running_with_inventory_upload","value"=>"0"]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        DB::table("settings")->where("key","is_inventory_downloaded")->delete();
        DB::table("settings")->updateOrInsert("key","running_with_inventory_upload")->delete();
    }
}
