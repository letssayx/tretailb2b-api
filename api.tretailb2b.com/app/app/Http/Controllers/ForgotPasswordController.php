<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPasswordMail;
use Illuminate\Support\Facades\Validator;
use App\ForgotPassword;
use App\Helper\ApiAuth;
use App\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App;
class ForgotPasswordController extends Controller{


    public function SendLink(Request $request){
       try{
		 $inputs=$request->only('email');
		 $validation=Validator::make($inputs,[
			'email'=>'required|exists:users'
         
		 ]);
		 if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $validation->errors()->first());
            return response()->json($error_obj);
         }
		 $previousTokens=ForgotPassword::where('email',$request->email);
		 if($previousTokens->count()!=0){
			 $previousTokens->delete();
		 }
		 $token=ForgotPassword::create([
			'email'=>$request->email,
			'token'=>Str::random(60)
		 ]);
		 if($token && $this->sendResetEmail($request->email,$token)){
		    return response()->json([
			 'status'=>'success',
			 'message'=>'Password reset link sent',
		     ]);
	     }
		 return response()->json([
			'status'=>'fail',
			'message'=>'Failed to send email',
			]);
	   }catch(\Exception $e){
		   return  response()->json([
			            'status'=>'fail',
			            'message'=>'Server error',
		     ]);
	   }
    }
	private function sendResetEmail($email, $token){

      $user = User::where('email', $email)->select('name', 'email')->first();
      $link = env('APP_FRONTEND_URL') . '/#/password-update/' . $token->token . '?email=' . urlencode($user->email);
      try {
         $details=[
			 'name'=>$user->name,
			 'app'=>'Tretail',
			 'validity'=>$token->created_at->addDay(),
			 'link'=>$link
		 ];
	     Mail::to($user->email)->send(new ForgotPasswordMail($details));
         return true;
      } catch (\Exception $e) {
         return false;
      }
   }

   public function ResetPassword(Request $request){
	  try{
	     $inputs=$request->only('email','token','password','password_confirmation');
		 $validation=Validator::make($inputs,[
			'email'=>'required|exists:users',
			'token'=>'required|string',
			'password' => 'required|min:6|confirmed',
		 ]);
		 if ($validation->fails()) {
            $errors = $validation->errors();
            $error_obj = array('status' => 'fail', 'message' => $validation->errors()->first());
            return response()->json($error_obj);
         }
		  $token=ForgotPassword::
		  where('email',$request->email)
		 ->where('token',$request->token)
		 ->orderBy('id','DESC')
		 ->first();
		 $user=User::where('email',$request->email)->first();
		 if($token){
			$user->password=Hash::make($request->password);
			$user->save();
            $token->delete();
			return response()->json([
				'status'=>'success',
				'message'=>'Password reseted successfuly',
				]);

		 }else{
			return response()->json([
				'status'=>'fail',
				'message'=>'Failed to reset password',
				]);
		 }
	  }catch(\Exception $e){
		   return  response()->json([
			'status'=>'fail',
			'message'=>'Server error'.$e->getMessage(),
          ]);
	  }
   }

   public function AddPassword(Request $request){
	// $user=User::where('id',$id)->get()
	try{
		$api_auth=App::make(ApiAuth::class);
		
		// return response()->json($api_auth->user()); 
		$user_details=$api_auth->user();
	$input_array = $request->json()->all();
    $input=$request->only('old_password','new_password','confirm_password');
	$validation=Validator::make($input,[
		'old_password' => 'required|min:6',
		'new_password' => 'required|min:6',
		'confirm_password' => 'required|min:6'
	 ]);
	 if ($validation->fails()) {
		$errors = $validation->errors();
		$error_obj = array('status' => 'fail', 'message' => $validation->errors()->first());
		return response()->json($error_obj, 400);
	 }
	$user=User::find($user_details->user_id);
	// return response()->json($user);
	// $user=User::where('email',$request->email)->first();
	// $user->password = Hash::make($input_array['old_password']);
	if (!Hash::check($input_array['old_password'], $user->password)) 
	{
		$error_obj = array('status' => 'fail', 'message' => 'Invalid password');
		return response()->json($error_obj, 400);
	}
	// $user->password = Hash::make($input_array['confirm_password']);
		if($input_array['new_password']==$input_array['confirm_password'])
		{   $user->password = Hash::make($input_array['new_password']);
			$user->save();
		} 
		else{
			$error=array('status' => 'fail', 'message' => 'Confirm password does not match');
			return response()->json($error,400);
		}
		return response()->json(["status" => "success","message" => "Successfully Password Change"],200); 
    }
	catch(Exception $e){
		   $error=array('status'=>'fail','message'=>$e->getMessage());
           return response()->json($error,500); 
	}
  }
   
}