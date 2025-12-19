<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Notifications\SendUserNotification;
use Illuminate\Support\Facades\Notification;

class AdminNotificationController extends Controller
{
   public function send(Request $request)
{
    $request->validate([
        'title'   => 'required|string|max:100',
        'message' => 'required|string',
        'users'   => 'required|array',
    ]);

    $users = User::whereIn('id', $request->users)->get();

    Notification::send($users, new SendUserNotification(
        $request->title,
        $request->message,
    ));

    return response()->json(['success' => true]);
}

}
