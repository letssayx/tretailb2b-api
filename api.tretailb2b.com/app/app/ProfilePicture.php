<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProfilePicture extends Model
{
    //
    use SoftDeletes;
    protected $table = "profile_pictures";
    public $fillable = ['path', 'name', 'bucket'];
    public $timestamps = true;

}
