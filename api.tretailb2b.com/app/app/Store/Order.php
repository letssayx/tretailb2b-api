<?php

namespace App\Store;

use Illuminate\Database\Eloquent\Model;

use Spatie\Activitylog\Traits\LogsActivity;

class Order extends Model
{

    use LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
    ];

    protected static $logAttribute = [
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

    public function lineitem() {
        return $this->hasMany('App\Store\Lineitem');

    }

    public function order_tracks() {
        return $this->hasMany('App\Store\OrderTrack');

    }

    /*
    public function primary_order() {
        return $this->belongsTo('App\Store\Order','parent_order_id','id');
    }
    */
}
