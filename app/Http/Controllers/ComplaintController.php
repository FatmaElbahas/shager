<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\FamilyDataMember;
use App\Models\FamilyTree;
use App\Models\Message;
use App\Notifications\ComplaintReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class ComplaintController extends Controller
{
    private function getFamilyTreeId($user)
    {
        if ($user->role === 'tree_creator') {
            $familyTree = FamilyTree::where('user_id', $user->id)->first();
            return $familyTree ? $familyTree->id : null;
        } else {
            $member = FamilyDataMember::where('user_id', $user->id)->first();
            return $member ? $member->family_tree_id : null;
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:financial,other,behavioral,technical',
            'details' => 'required|string',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:2048',
        ]);

        $user = Auth::user();
        $familyTreeId = $this->getFamilyTreeId($user);

        // حفظ الملف إذا وجد
        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('complaints', 'public');
        }

        // إنشاء الشكوى
        $complaint = Complaint::create([
            'user_id' => $user->id,
            'family_tree_id' => $familyTreeId,
            'title' => $request->title,
            'type' => $request->type,
            'details' => $request->details,
            'attachment' => $path,
        ]);

        // إنشاء الرسالة مرتبطة بنفس الـ family_tree
        Message::create([
            'user_id' => $user->id,
            'family_tree_id' => $familyTreeId,
            'type' => $request->type,
            'message' => "عنوان الشكوى: " . $request->title .
                "\nنوع الشكوى: " . $request->type .
                "\nالتفاصيل: " . $request->details,
            'status' => 'unanswered',
        ]);

        $companyEmail = "engn25522@gmail.com";
        Notification::route('mail', $companyEmail)
            ->notify(new ComplaintReceived($complaint, $user));

        return response()->json(['message' => 'تم إرسال الشكوى بنجاح!']);
    }

    public function index()
    {
        $complaints = \App\Models\Complaint::with('familyTree')->get();

        $result = $complaints->map(function ($complaint) {
            return [
                'id' => $complaint->id,
                'title' => $complaint->title,
                'type' => $complaint->type,
                'status' => $complaint->status,
                'tree_name' => $complaint->familyTree?->tree_name,
                'created_at' => $complaint->created_at,
            ];
        });

        return response()->json($result);
    }



    public function view($id)
    {
        $complaint = \App\Models\Complaint::with(['familyTree.user'])
            ->find($id);

        if (!$complaint) {
            return response()->json(['message' => 'الشكوى غير موجودة'], 404);
        }

        return response()->json([
            'id' => $complaint->id,
            'title' => $complaint->title,
            'type' => $complaint->type,
            'details' => $complaint->details,
            'status' => $complaint->status,
            'name' => $complaint->familyTree?->user?->name,
            'tree_name' => $complaint->familyTree?->tree_name,
            'email' => $complaint->familyTree?->user?->email,
            'phone' => $complaint->familyTree?->user?->phone,
            'profile_picture' => $complaint->familyTree?->user?->profile_picture,
            'created_at' => $complaint->created_at,
        ]);
    }

    public function viewAll($user_id)
    {
        // جلب كل الشكاوى الخاصة بالمستخدم بناءً على user_id
        $complaints = \App\Models\Complaint::with(['familyTree.user'])
            ->whereHas('familyTree', function ($query) use ($user_id) {
                $query->where('user_id', $user_id);
            })
            ->get();

        // لو المستخدم ما عندوش شكاوى
        if ($complaints->isEmpty()) {
            return response()->json(['message' => 'لا توجد شكاوى لهذا المستخدم'], 404);
        }

        // تجهيز البيانات في شكل JSON منسق
        $result = $complaints->map(function ($complaint) {
            return [
                'id' => $complaint->id,
                'title' => $complaint->title,
                'type' => $complaint->type,
                'details' => $complaint->details,
                'status' => $complaint->status,
                'name' => $complaint->familyTree?->user?->name,
                'tree_name' => $complaint->familyTree?->tree_name,
                'email' => $complaint->familyTree?->user?->email,
                'phone' => $complaint->familyTree?->user?->phone,
                'profile_picture' => $complaint->familyTree?->user?->profile_picture,
                'created_at' => $complaint->created_at,
            ];
        });

        return response()->json($result);
    }




    public function reply(Request $request, $id)
    {
        $request->validate([
            'admin_reply' => 'required|string',
        ]);

        $complaint = \App\Models\Complaint::with('familyTree.user')->findOrFail($id);

        // حفظ الرد
        $complaint->update([
            'admin_reply' => $request->admin_reply,
        ]);

        // إرسال الإشعار لصاحب الشكوى (منشئ الشجرة)
        $user = $complaint->familyTree->user;

        $user->notify(new \App\Notifications\AdminRepliedToComplaint($complaint));

        return response()->json(['message' => 'تم إرسال الرد بنجاح']);
    }




    public function showReply($id)
    {
        // جلب الشكوى مع الرد وعلاقتها بالشجرة والمستخدم
        $complaint = \App\Models\Complaint::with(['familyTree.user'])
            ->findOrFail($id);

        // التحقق إذا كان هناك رد من الأدمن
        if (!$complaint->admin_reply) {
            return response()->json([
                'message' => 'لم يتم الرد بعد على هذه الشكوى',
                'admin_reply' => null,
            ]);
        }

        // إرجاع الرد في حالة وجوده
        return response()->json([
            'message' => 'تم جلب الرد بنجاح',
            'admin_reply' => $complaint->admin_reply,
            'id' => $complaint->id,
            'title' => $complaint->title,
            'type' => $complaint->type,
            'details' => $complaint->details,
            'status' => $complaint->status,
            'name' => $complaint->familyTree?->user?->name,
            'tree_name' => $complaint->familyTree?->tree_name,
            'email' => $complaint->familyTree?->user?->email,
            'phone' => $complaint->familyTree?->user?->phone,
            'profile_picture' => $complaint->familyTree?->user?->profile_picture,
            'created_at' => $complaint->created_at,
        ]);
    }




    public function show($id)
    {
        $user = Auth::user();
        $familyTreeId = $this->getFamilyTreeId($user);

        $complaint = Complaint::with(['familyTree', 'user'])
            ->where('user_id', $user->id)
            ->where('family_tree_id', $familyTreeId)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'id' => $complaint->id,
            'title' => $complaint->title,
            'type' => $complaint->type,
            'status' => $complaint->status,
            'family_tree_id' => $complaint->family_tree_id,
            'tree_name' => $complaint->familyTree?->tree_name,
            'user' => $complaint->user,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,resolved',
        ]);


        $complaint = Complaint::where('id', $id)
            ->firstOrFail();

        $complaint->update([
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'تم تحديث حالة الشكوى بنجاح']);
    }
}
