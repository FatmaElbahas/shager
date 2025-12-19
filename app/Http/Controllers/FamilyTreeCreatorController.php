<?php

namespace App\Http\Controllers;

use App\Models\CreatorFamilyTree;
use App\Models\FamilyCreatorMembers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FamilyTreeCreatorController extends Controller
{
    public function index()
    {
        $tree = CreatorFamilyTree::where('user_id', Auth::id())->with('members')->first();
        return response()->json($tree);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'family_name' => 'required|string',
            'cover_image' => 'nullable|image',
            'family_logo' => 'nullable|image'
        ]);

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('covers', 'public');
        }
        if ($request->hasFile('family_logo')) {
            $data['family_logo'] = $request->file('family_logo')->store('logos', 'public');
        }

        $data['user_id'] = Auth::id();
        $tree = CreatorFamilyTree::create($data);

        return response()->json($tree, 201);
    }

    public function addMember(Request $request, $treeId)
    {
        $tree = CreatorFamilyTree::where('user_id', Auth::id())->findOrFail($treeId);

        $memberData = $request->validate([
            'full_name' => 'required|string',
            'email' => 'nullable|email',
            'status' => 'nullable|string',
            'joined_date' => 'nullable|date',
            'membership_type' => 'nullable|string',
            'notes' => 'nullable|string',
            'avatar' => 'nullable|image'
        ]);

        if ($request->hasFile('avatar')) {
            $memberData['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $memberData['family_tree_id'] = $tree->id;
        $member = FamilyCreatorMembers::create($memberData);

        return response()->json($member, 201);
    }

    public function deleteMember($treeId, $memberId)
    {
        $member = FamilyCreatorMembers::where('family_tree_id', $treeId)->findOrFail($memberId);
        $member->delete();
        return response()->json(['message' => 'Member deleted']);
    }

    public function updateMember(Request $request, $treeId, $memberId)
    {
        $member = FamilyCreatorMembers::where('family_tree_id', $treeId)->findOrFail($memberId);

        $data = $request->validate([
            'full_name' => 'sometimes|string',
            'email' => 'nullable|email',
            'status' => 'nullable|string',
            'joined_date' => 'nullable|date',
            'membership_type' => 'nullable|string',
            'notes' => 'nullable|string',
            'avatar' => 'nullable|image'
        ]);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $member->update($data);

        return response()->json($member);
    }
}
