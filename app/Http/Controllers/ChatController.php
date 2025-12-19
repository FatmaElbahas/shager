<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Events\MessageSent;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $message = ChatMessage::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $validated['receiver_id'],
            'message' => $validated['message'],
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json(['message' => $message]);
    }

    public function fetchMessages($receiver_id)
    {
        return ChatMessage::where(function ($q) use ($receiver_id) {
            $q->where('sender_id', auth()->id())
                ->where('receiver_id', $receiver_id);
        })->orWhere(function ($q) use ($receiver_id) {
            $q->where('sender_id', $receiver_id)
                ->where('receiver_id', auth()->id());
        })->orderBy('created_at')->get();
    }
}
