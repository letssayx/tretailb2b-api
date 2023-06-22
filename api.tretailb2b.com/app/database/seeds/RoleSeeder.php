<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        DB::table('roles')->insert([
            'user_id' => 2,
            'client_id' => 1,
            'permissions' => '{"products":"*","oders":"GET"}',
            'created_at' => Carbon::now()->toDateTimeString()
        ]);

        DB::table('roles')->insert([
            'user_id' => 2,
            'client_id' => 2,
            'permissions' => '{"products":"GET","oders":"*"}',
            'created_at' => Carbon::now()->toDateTimeString()
        ]);
    }
}
