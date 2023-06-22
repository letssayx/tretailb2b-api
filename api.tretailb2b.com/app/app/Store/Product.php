<?php

namespace App\Store;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name','description','asin','sku','brand_id','category_id','launch_date','active'
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

    public function category()
    {
        return $this->belongsTo('App\Store\Category');
    }

    public function brand()
    {
        return $this->belongsTo('App\Store\Brand');
    }
}
