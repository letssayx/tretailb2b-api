<?php

namespace App\Store;

use Illuminate\Database\Eloquent\Model;

class PickListItem extends Model
{
    //
    protected $table = 'picklist_items';

    public function picklist()
    {
        return $this->belongsTo(PickList::class, 'picklist_id', 'id');
    }

    public function lineitem(){
        return $this->belongsTo(Lineitem::class, 'lineitem_id', 'id');
    }
}
