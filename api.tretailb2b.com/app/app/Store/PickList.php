<?php

namespace App\Store;

use Illuminate\Database\Eloquent\Model;

class PickList extends Model
{
    //
    protected $table = 'picklists';

    public function items(){
        return $this->hasMany(PickListItem::class,  'picklist_id', 'id');
    }
}
