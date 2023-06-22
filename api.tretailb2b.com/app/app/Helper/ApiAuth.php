<?php

namespace App\Helper;

class ApiAuth 
{

    protected $user_details;

    public function user()
    {
        return $this->user_details;
    }

    public function login($user)
    {
        $this->user_details = new UserDetails($user['user_id'], $user['is_logged'], $user['is_admin'], $user['db_access'], $user['client_id'],$user['super_admin'],$user['client_details']); 
    }

    public function logout()
    { 
        $this->user_details=null;
    }

}

class UserDetails { 
      
    /* Member variables */
    var $user_id;
    var $is_logged;
    var $is_admin;
    var $db_access;
    var $client_id;
    var $super_admin;
    var $client_details;
      
    function __construct($user_id, $is_logged, $is_admin, $access, $client_id,$super_admin,$client_details)  
    { 
        $this->user_id=$user_id;
        $this->is_logged=$is_logged;
        $this->is_admin=$is_admin;
        $this->db_access=$access;
        $this->client_id=$client_id;
        $this->super_admin=$super_admin;
        $this->client_details=$client_details;
    } 
}



