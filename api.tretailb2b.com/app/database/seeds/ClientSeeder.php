<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        DB::table('clients')->insert([
            'name' => 'Store 1',
            'address' => 'Test Address 1',
            'phone' => '9822225222',
            'email' => 'store1@gmail.com',
            'db_host' => env("DB_HOST", "127.0.0.1"),
            'db_name' => 'store1',
            'db_user' => 'store1',
            'db_pass' => 'store1',
            'active' => 1,
            'created_at' => Carbon::now()->toDateTimeString()
        ]);
        DB::table('clients')->insert([
            'name' => 'Store 2',
            'address' => 'Test Address 2',
            'phone' => '6522225222',
            'email' => 'store2@gmail.com',
            'db_host' => env("DB_HOST", "127.0.0.1"),
            'db_name' => 'store2',
            'db_user' => 'store2',
            'db_pass' => 'store2',
            'active' => 1,
            'created_at' => Carbon::now()->toDateTimeString()
        ]);
    }
}
