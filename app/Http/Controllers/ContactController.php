<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Mail\ContactUsMail;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        $details = $request->only(['name', 'email', 'subject', 'message']);

        Mail::to('shagertk@gmail.com')->send(new ContactUsMail($details));

        return response()->json([
            'message' => 'تم إرسال الرسالة بنجاح!'
        ], 200);
    }
}
