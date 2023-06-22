<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ForgotPassword extends Model
{
    //
    use SoftDeletes;
    protected $table = "password_reset";
    protected $fillable=['email','token'];
    public $timestamps = true;
}
