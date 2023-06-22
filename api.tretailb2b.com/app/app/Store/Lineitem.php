<?php

namespace App\Store;

use Illuminate\Database\Eloquent\Model;

class Lineitem extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'amount',
        'tax',
        'discount'
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

    public function item()
    {
        return $this->belongsTo('App\Store\Item');
    }

    public function lineitem_childs()
    {
        return $this->hasMany('App\Store\LineitemChild','lineitem_id');
    }
}
