<?php

namespace App\Store;

use Illuminate\Database\Eloquent\Model;

class GstAdd extends Model
{
    protected $table = 'add_gst_table';
    protected $fillable = [
       'address',
       'gstNo',
       'state'
    ];
}
