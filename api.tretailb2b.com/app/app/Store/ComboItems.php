<?php
namespace App\Store;

use Illuminate\Database\Eloquent\Model;


class ComboItems extends Model{
   
    protected $table="combo_items";


    public $timestamps=true;
    

    protected $fillable=['child_item_id','quantity'];

    public function item(){

        return $this->belongsTo('App\Store\Item','item_id','id');

    }
    public function child_item(){

        return $this->belongsTo('App\Store\Item','child_item_id','id');
        
    }
 
}