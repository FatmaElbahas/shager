<?php

namespace App\Http\Controllers;

use App\Models\Occasion;
use App\Models\FamilyTree;
use App\Models\FamilyDataMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FamilyMapLocationController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        // الأدمن والمساعد يشوفون كل المواقع
        if (in_array($user->role, ['admin', 'admin_assistant'])) {
            $occasions = Occasion::whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->get(['id', 'name', 'latitude', 'longitude', 'city']);

            return response()->json($occasions);
        }

        // المستخدم العادي يشوف فقط المواقع العامة
        if ($user->role === 'user') {
            $occasions = Occasion::where('visibility', 'public')
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->get(['id', 'name', 'latitude', 'longitude', 'city']);

            return response()->json($occasions);
        }

        // tree_creator أو عضو في شجرة عائلية
        $familyTreeId = null;

        // إذا كان tree_creator، احصل على شجرته
        if ($user->role === 'tree_creator') {
            $familyTree = FamilyTree::where('user_id', $user->id)->first();
            $familyTreeId = $familyTree?->id;
        }

        // إذا كان عضو في شجرة عائلية (حتى لو كان tree_creator أيضاً)
        $member = FamilyDataMember::where('user_id', $user->id)->first();
        if ($member) {
            $familyTreeId = $member->family_tree_id;
        }

        // بناء الاستعلام بناء على الصلاحيات
        $query = Occasion::whereNotNull('latitude')
            ->whereNotNull('longitude');

        if ($familyTreeId) {
            // إذا كان لديه شجرة عائلية، يشوف مواقع شجرته فقط
            $query->where('family_tree_id', $familyTreeId);
        } else {
            // إذا لم يكن لديه شجرة، لا يرى أي مواقع
            $query->whereRaw('1 = 0');  // هذا سيعيد نتيجة فارغة
        }


        $occasions = $query->get(['id', 'name', 'latitude', 'longitude', 'city']);
        return response()->json($occasions);
    }
}
