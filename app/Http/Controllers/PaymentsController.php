<?php

namespace App\Http\Controllers;

use App\Models\PaymentCard;
use App\Models\Transactions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentsController extends Controller
{
    // عرض البطاقات والرصيد وسجل المعاملات
    public function index()
    {
        $user = Auth::user();
        $cards = PaymentCard::where('user_id', $user->id)->get();
        $transactions = Transactions::where('user_id', $user->id)->latest()->get();

        $balance = $transactions->where('status', 'completed')->sum('amount'); // مثال لحساب الرصيد

        return response()->json([
            'cards' => $cards,
            'balance' => $balance,
            'transactions' => $transactions,
        ]);
    }

    // إضافة بطاقة جديدة
    public function storeCard(Request $request)
    {
        $request->validate([
            'card_holder_name' => 'required|string',
            'card_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:1048',
            'card_number' => 'required|digits_between:13,19',
            'expiry_date' => 'required|date_format:m/y',
            'cvv' => 'required|digits:3',
            'bank_name' => 'nullable|string',
        ]);

        $lastFour = substr($request->card_number, -4);

        $card = PaymentCard::create([
            'user_id' => Auth::id(),
            'card_photo' => $request->card_photo,
            'card_holder_name' => $request->card_holder_name,
            'card_number' => encrypt($request->card_number),
            'last_four_digits' => $lastFour,
            'expiry_date' => $request->expiry_date,
            'cvv' => encrypt($request->cvv),
            'bank_name' => $request->bank_name,
        ]);

        return response()->json(['message' => 'Card added successfully', 'card' => $card]);
    }

    // حذف بطاقة
    public function destroyCard($id)
    {
        $card = PaymentCard::where('user_id', Auth::id())->findOrFail($id);
        $card->delete();

        return response()->json(['message' => 'Card deleted successfully']);
    }
}
