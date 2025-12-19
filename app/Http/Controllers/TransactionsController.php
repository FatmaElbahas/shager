<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Transactions;
use Illuminate\Http\Request;

class TransactionsController extends Controller
{
    public function index(Request $request)
    {
        $query = Transactions::with('user')->latest();

        // تحقق من وجود كلمة البحث
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;

            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // استرجاع 6 معاملات لكل صفحة
        $transactions = $query->paginate(6);

        return response()->json($transactions);
    }



    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan' => 'required|in:basic,advanced,custom',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:paid,unpaid,rejected,expired',
            'auto_renew' => 'boolean',
            'payment_date' => 'required|date',
        ]);

        $data['transaction_number'] = strtoupper(uniqid('TXN_'));

        $transaction = Transactions::create($data);

        return response()->json([
            'message' => 'تم إنشاء السجل بنجاح',
            'transaction' => $transaction
        ]);
    }

    public function show($id)
    {
        $transaction = Transactions::with('user')->findOrFail($id);
        return response()->json($transaction);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transactions::findOrFail($id);

        $data = $request->validate([
            'plan' => 'sometimes|in:basic,advanced,custom',
            'amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:paid,unpaid,rejected,expired',
            'auto_renew' => 'sometimes|boolean',
            'payment_date' => 'sometimes|date',
        ]);

        $transaction->update($data);

        return response()->json(['message' => 'تم تحديث السجل بنجاح', 'transaction' => $transaction]);
    }
}
