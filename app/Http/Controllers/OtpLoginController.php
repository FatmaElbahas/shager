<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendOtpMail;
use App\Models\User;

class OtpLoginController extends Controller
{
    public function requestOtp(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $otp = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            ['token' => $otp, 'created_at' => now()]
        );

        Mail::to($request->email)->send(new SendOtpMail($otp));

        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp'   => 'required|digits:4'
        ]);

        $record = DB::table('password_resets')->where('email', $request->email)->first();

        if (!$record || trim($record->token) !== trim($request->otp)) {
            return response()->json(['message' => 'رمز التحقق غير صحيح.'], 401);
        }

        $user = User::where('email', $request->email)->first();

        return response()->json([
            'message' => 'OTP verified successfully',
            'user' => $user
        ]);
    }
}
