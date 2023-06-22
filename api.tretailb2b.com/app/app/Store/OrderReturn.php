<?php

namespace App\Store;

use Illuminate\Database\Eloquent\Model;

class OrderReturn extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        //'email_verified_at' => 'datetime',
    ];

    public function lineitem()
    {
        return $this->belongsTo('App\Store\Lineitem');
    }

    public function order()
    {
        return $this->belongsTo('App\Store\Order');
    }

}
