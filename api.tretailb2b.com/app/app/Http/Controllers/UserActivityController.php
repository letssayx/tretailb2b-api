<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App;
use App\Http\Middleware\TretailAuth;
use App\Store\Activity;

class UserActivityController extends Controller
{
    // Show User Activity from Database
    public function getLogList(Request $request) {
        try {
            if ($request->id) {
                // Show a particular user's activity
                

            } else {
                // Show all user activity
                $allLoggedActivity = Activity::all();
                $allLogged_Total_Activity = count($allLoggedActivity);
    
                if(isset($query['filter'])) {
                    $filter=json_decode($query['filter'],true);
                }
    
                if(isset($query['range']))  {
                    $range=json_decode($query['range'],true);
                }

                if(isset($query['sort'])) {
                    $sort=json_decode($query['sort'],true);
                }
    
                $res=array('status'=>'success','message'=>'Retrieved all activity logs successfully','userActivity'=>$allLoggedActivity);
                return response()->json($res,200)->header('X-Total-Count', isset($allLogged_Total_Activity) ? $allLogged_Total_Activity : 0);
            }
        } catch(\Exception $e) {
            // On error while fetching user activity logs return error response
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }

    // Insert a User Activity to Database
    public function CreateActivity(Request $request) {
        try {
            
        } catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
        }

    }
    
}
