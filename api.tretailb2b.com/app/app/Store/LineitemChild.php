<?php

namespace App\Store;

use Illuminate\Database\Eloquent\Model;

class LineitemChild extends Model
{
    //
    protected $table="lineitem_childs";





    public function item()
    {
        return $this->belongsTo('App\Store\Item');
    }
    

    
    function lineitem(){

        return $this->belongsTo('App\Store\Lineitem','lineitem_id');

    }
}
