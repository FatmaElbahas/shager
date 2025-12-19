<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // استخدام updateOrCreate بدلاً من if/else
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()], // الشرط
                [
                    'name' => $googleUser->getName(),
                    'password' => bcrypt(uniqid()), // باسورد عشوائي
                    'role' => 'user',
                ]
            );

            Auth::login($user); // تسجيل دخول المستخدم

            // تحويل المستخدم مباشرةً إلى Home.html
            return redirect('https://mediumblue-seahorse-369825.hostingersite.com/Home.html');
        } catch (\Exception $e) {
            return redirect('/login.html')->with('error', 'فشل تسجيل الدخول بجوجل، حاول مرة أخرى.');
        }
    }
}
