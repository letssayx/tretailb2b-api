<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            'name' => 'Tretail',
            'email' => 'tretailb2b@gmail.com',
            'password' => Hash::make('Passw0rd'),
            'active' => 1,
            'is_admin' => 1,
            'created_at' => Carbon::now()->toDateTimeString()
        ]);
    }
}
