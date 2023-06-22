<?php

namespace App\Store;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
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

    public function product()
    {
        return $this->belongsTo('App\Store\Product');
    }

    public function combo_items(){

        return $this->hasMany('App\Store\ComboItems','item_id','id');
        
    }

    public function updateQuantityWithLog(int $quantity, string $reason = "No reason"){

        if($quantity !== $this->quantity){
             //create inventory transaction log if inventory value changed
             $log_quantity  = abs( $quantity - $this->quantity );
             $inventory_log = new WMSTransaction;
             $inventory_log->quantity = $log_quantity;
             $inventory_log->item_id  = $this->id;
             $inventory_log->reason   = $reason;
             $inventory_log->save();
        }
        //update item inventory value before save
        $this->quantity = $quantity;
    }

}
