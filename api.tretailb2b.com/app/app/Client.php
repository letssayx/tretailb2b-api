<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'address', 'phone', 'email',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'db_host', 'db_name','db_port', 'db_user','db_pass', 'db_ssl_ca',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        //'email_verified_at' => 'datetime',
    ];

    public function users()
    {
        return $this->belongsToMany('App\User', 'roles')->as('role')->withPivot('permissions')->withPivot('id')->withTimestamps();
    }

}
