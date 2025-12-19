<?php

namespace App\Http\Controllers;

use App\Models\FamilyDataMember;
use App\Models\FamilyTree;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Models\FamilyRelation;
use Illuminate\Support\Facades\Auth;

class FamilyDataMemberController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $tree = FamilyTree::where('user_id', $user->id)->first();

        if (!$tree) {
            return response()->json(['message' => 'لا توجد شجرة مرتبطة بالمستخدم الحالي'], 404);
        }

        $search = $request->query('search');

        $familyMembersTree = FamilyDataMember::with(['user', 'childrenRelations', 'motherRelation', 'fatherRelation'])
            ->where('family_tree_id', $tree->id)
            ->when($search, function ($query) use ($search) {
                return $query->where('name', 'LIKE', "%{$search}%");
            })
            ->get();

        return response()->json([
            'family_data_members_tree' => $familyMembersTree,
            'template_id' => $tree->template_id, // إرجاع template_id الخاص بالشجرة الحالية
            'message' => 'تم جلب بيانات شجرة العائلة بنجاح'
        ]);
    }

public function store(Request $request)
{
    // 🧹 تنظيف البيانات قبل الـ validation
    $requestData = $request->all();

    // تنظيف father_id
    if (empty($requestData['father_id']) || $requestData['father_id'] === '' || $requestData['father_id'] === '0' || $requestData['father_id'] === 0) {
        unset($requestData['father_id']);
    } else {
        $requestData['father_id'] = (int) $requestData['father_id'];
    }

    // تنظيف mother_id
    if (empty($requestData['mother_id']) || $requestData['mother_id'] === '' || $requestData['mother_id'] === '0' || $requestData['mother_id'] === 0) {
        unset($requestData['mother_id']);
    } else {
        $requestData['mother_id'] = (int) $requestData['mother_id'];
    }

    // ✅ التحقق من صحة البيانات
    $data = validator($requestData, [
        'email'          => 'nullable|string|email|max:255|unique:users',
        'password'       => 'nullable|string|min:8',
        'relation'       => 'required|string|in:father,mother,son,daughter',
        'name'           => 'required|string|max:255',
        'job'            => 'nullable|string',
        'status'         => 'required|in:alive,deceased',
        'birth_date'     => 'nullable|date',
        'marital_status' => 'nullable|in:single,married',
        'phone_number'   => 'nullable|string',
        'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:10240',
        'father_id'      => 'nullable|integer',
        'mother_id'      => 'nullable|integer',
    ])->validate();

    // ✅ رفع الصورة إن وُجدت
    if ($request->hasFile('profile_picture')) {
        $data['profile_picture'] = $request->file('profile_picture')
            ->store('family_pictures', 'public');
    }

    // ✅ جلب الشجرة الخاصة بالمستخدم الحالي
    $user = Auth::user();
    $tree = FamilyTree::where('user_id', $user->id)->first();
    if (!$tree) {
        return response()->json(['message' => 'لا توجد شجرة عائلة مسجلة لهذا المستخدم.'], 404);
    }

    // ✅ جلب آخر اشتراك نشط للمستخدم
    $subscription = \App\Models\Subscription::where('user_id', $user->id)
        ->where('status', 'active')
        ->latest()
        ->first();

    if (!$subscription) {
        return response()->json(['message' => 'لا يوجد اشتراك نشط. يرجى الاشتراك أولاً.'], 403);
    }

    // ✅ جلب خطة الاشتراك
    $plan = \App\Models\Plan::find($subscription->plan_id);
    if (!$plan) {
        return response()->json(['message' => 'الخطة غير موجودة.'], 404);
    }

    // ✅ حساب عدد الأعضاء الحاليين في الشجرة
    $currentMembersCount = \App\Models\FamilyDataMember::where('family_tree_id', $tree->id)->count();

    // ✅ تحديد الحد الأقصى حسب الخطة
    $planLimits = [
        'primary' => 50,
        'advanced' => 500,
        'custom' => 1000,
        'featured' => null, // لا يوجد حد
    ];

    $planName = strtolower($plan->plan ?? $plan->name ?? '');
    $maxMembers = $planLimits[$planName] ?? 50; // الافتراضي 50 لو الخطة غير معروفة

    if ($maxMembers !== null && $currentMembersCount >= $maxMembers) {
        return response()->json([
            'message' => "لقد وصلت إلى الحد الأقصى من عدد الأفراد المسموح به في خطة الاشتراك ({$planName})."
        ], 403);
    }

    // ✅ إنشاء المستخدم الجديد
    $newUser = User::create([
        'name'     => $data['name'],
        'email'    => $data['email'],
        'password' => isset($data['password'])
            ? Hash::make($data['password'])
            : Hash::make('12345678'),
        'role'     => 'family_member',
        'profile_picture' => $data['profile_picture'] ?? null,
        'job'      => $data['job'] ?? null,
        'status'   => 'active',
        'birth_date' => $data['birth_date'] ?? null,
        'phone'    => $data['phone_number'] ?? null,
    ]);

    // ✅ إنشاء الفرد داخل جدول العائلة
    $member = FamilyDataMember::create([
        'family_tree_id'  => $tree->id,
        'user_id'         => $newUser->id,
        'relation'        => $data['relation'],
        'name'            => $data['name'],
        'job'             => $data['job'] ?? null,
        'status'          => $data['status'],
        'birth_date'      => $data['birth_date'] ?? null,
        'marital_status'  => $data['marital_status'] ?? null,
        'phone_number'    => $data['phone_number'] ?? null,
        'profile_picture' => $data['profile_picture'] ?? null,
    ]);

    // ✅ تسجيل العلاقات لو الفرد ابن/ابنة
    if (in_array($data['relation'], ['son', 'daughter'])) {
        $fatherId = null;
        $motherId = null;

        if (isset($data['father_id']) && $data['father_id']) {
            $father = FamilyDataMember::where('family_tree_id', $tree->id)
                ->find($data['father_id']);
            if ($father) {
                $fatherId = $father->id;
            }
        }

        if (isset($data['mother_id']) && $data['mother_id']) {
            $mother = FamilyDataMember::where('family_tree_id', $tree->id)
                ->find($data['mother_id']);
            if ($mother) {
                $motherId = $mother->id;
            }
        }

        FamilyRelation::create([
            'father_id' => $fatherId,
            'mother_id' => $motherId,
            'child_id'  => $member->id,
        ]);
    }

    return response()->json([
        'message' => 'تم إضافة الفرد وربطه بالشجرة بنجاح 🎉',
        'user'    => $newUser,
        'member'  => $member,
    ], 201);
}





    public function getParents()
    {
        $tree = FamilyTree::where('user_id', Auth::id())->first();
        if (!$tree) {
            return response()->json(['message' => 'لا توجد شجرة'], 404);
        }

        $parents = FamilyDataMember::where('family_tree_id', $tree->id)
            ->whereIn('relation', ['father', 'mother'])
            ->get();

        return response()->json(['parents' => $parents]);
    }

    // public function getTreeData()
    // {
    //     $tree = FamilyTree::with('template')
    //         ->where('user_id', Auth::id())
    //         ->first();

    //     if (!$tree) {
    //         return response()->json(['message' => 'لا توجد شجرة'], 404);
    //     }

    //     $members = FamilyDataMember::with([
    //         'fatherRelation.father',
    //         'motherRelation.mother',
    //         'childrenRelations.child'
    //     ])->where('family_tree_id', $tree->id)->get();

    //     $nodes = [];
    //     $parents = [];
    //     $children = [];

    //     // تصنيف الأعضاء إلى آباء وأطفال
    //     foreach ($members as $member) {
    //         // تحديد الجنس حسب صلة القرابة
    //         $relation = $member->relation ?? null;
    //         $gender = null;

    //         if ($relation) {
    //             if (in_array($relation, ['father', 'son'])) {
    //                 $gender = 'male';
    //             } elseif (in_array($relation, ['mother', 'daughter'])) {
    //                 $gender = 'female';
    //             }
    //         }

    //         // جمع أسماء الأطفال
    //         $childrenNames = [];
    //         if ($member->childrenRelations) {
    //             foreach ($member->childrenRelations as $childRelation) {
    //                 if ($childRelation->child) {
    //                     $childrenNames[] = $childRelation->child->name;
    //                 }
    //             }
    //         }

    //         // الحصول على أسماء الوالدين
    //         $fatherName = $member->fatherRelation && $member->fatherRelation->father
    //             ? $member->fatherRelation->father->name
    //             : null;

    //         $motherName = $member->motherRelation && $member->motherRelation->mother
    //             ? $member->motherRelation->mother->name
    //             : null;

    //         $nodeData = [
    //             'text' => [
    //                 'name' => $member->name,
    //                 'relation' => $relation,
    //                 'status' => $member->status ?? 'unknown',
    //                 'job' => $member->job ?? null,
    //                 'birth_date' => $member->birth_date ?? null,
    //                 'email' => $member->email ?? null,
    //                 'phone_number' => $member->phone_number ?? null,
    //                 'marital_status' => $member->marital_status ?? null,
    //                 'father_name' => $fatherName,
    //                 'mother_name' => $motherName,
    //                 'children_names' => $childrenNames,
    //             ],
    //             'name' => $member->name,
    //             'relation' => $relation,
    //             'gender' => $gender,
    //             'children' => []
    //         ];

    //         $nodes[$member->id] = $nodeData;

    //         // تصنيف الأعضاء
    //         if (in_array($relation, ['father', 'mother'])) {
    //             $parents[] = $member;
    //         } elseif (in_array($relation, ['son', 'daughter'])) {
    //             $children[] = $member;
    //         }
    //     }

    //     // إنشاء خطوط الربط بين الأزواج والتعامل مع الحالات المختلفة
    //     $marriageLines = [];
    //     $processedChildren = []; // لتجنب تكرار الأطفال

    //     foreach ($children as $child) {
    //         // تجنب معالجة نفس الطفل أكثر من مرة
    //         if (in_array($child->id, $processedChildren)) {
    //             continue;
    //         }

    //         $fatherId = $child->fatherRelation && $child->fatherRelation->father
    //             ? $child->fatherRelation->father->id
    //             : null;

    //         $motherId = $child->motherRelation && $child->motherRelation->mother
    //             ? $child->motherRelation->mother->id
    //             : null;

    //         // الحالة الأولى: يوجد أب وأم معاً
    //         if ($fatherId && $motherId && isset($nodes[$fatherId]) && isset($nodes[$motherId])) {
    //             // إنشاء مفتاح للزوجين
    //             $coupleKey = min($fatherId, $motherId) . '_' . max($fatherId, $motherId);

    //             if (!isset($marriageLines[$coupleKey])) {
    //                 // إنشاء خط الربط
    //                 $lineId = 'line_' . $coupleKey;
    //                 $marriageLines[$coupleKey] = [
    //                     'id' => $lineId,
    //                     'text' => [
    //                         'name' => '━━━',
    //                         'relation' => 'marriage_line'
    //                     ],
    //                     'name' => '━━━',
    //                     'relation' => 'marriage_line',
    //                     'gender' => null,
    //                     'children' => []
    //                 ];

    //                 $nodes[$lineId] = $marriageLines[$coupleKey];

    //                 // ربط الأب والأم بخط الربط
    //                 $nodes[$fatherId]['children'][] = &$nodes[$lineId];
    //                 $nodes[$motherId]['children'][] = &$nodes[$lineId];
    //             }

    //             // إضافة الطفل لخط الربط
    //             $marriageLines[$coupleKey]['children'][] = &$nodes[$child->id];
    //             $nodes[$marriageLines[$coupleKey]['id']]['children'][] = &$nodes[$child->id];
    //             $processedChildren[] = $child->id;
    //         }
    //         // الحالة الثانية: يوجد أب فقط
    //         elseif ($fatherId && isset($nodes[$fatherId]) && !$motherId) {
    //             $nodes[$fatherId]['children'][] = &$nodes[$child->id];
    //             $processedChildren[] = $child->id;
    //         }
    //         // الحالة الثالثة: يوجد أم فقط
    //         elseif ($motherId && isset($nodes[$motherId]) && !$fatherId) {
    //             $nodes[$motherId]['children'][] = &$nodes[$child->id];
    //             $processedChildren[] = $child->id;
    //         }
    //         // الحالة الرابعة: يوجد أب فقط (الأم غير موجودة في العقد)
    //         elseif ($fatherId && isset($nodes[$fatherId])) {
    //             $nodes[$fatherId]['children'][] = &$nodes[$child->id];
    //             $processedChildren[] = $child->id;
    //         }
    //         // الحالة الخامسة: يوجد أم فقط (الأب غير موجود في العقد)
    //         elseif ($motherId && isset($nodes[$motherId])) {
    //             $nodes[$motherId]['children'][] = &$nodes[$child->id];
    //             $processedChildren[] = $child->id;
    //         }
    //     }

    //     // إيجاد الآباء والأمهات (الأشخاص بدون والدين)
    //     $roots = collect($members)->filter(fn($m) => !$m->fatherRelation && !$m->motherRelation);

    //     if ($roots->count() > 1) {
    //         // إذا كان هناك أكثر من root (أب وأم منفصلين)، أنشئ root وهمي
    //         $treeStructure = [
    //             'text' => [
    //                 'name' => $tree->family_name ?? 'العائلة',
    //                 'relation' => 'family',
    //             ],
    //             'name' => $tree->family_name ?? 'العائلة',
    //             'relation' => 'family',
    //             'gender' => null,
    //             'children' => []
    //         ];

    //         foreach ($roots as $root) {
    //             if (isset($nodes[$root->id])) {
    //                 $treeStructure['children'][] = $nodes[$root->id];
    //             }
    //         }
    //     } elseif ($roots->count() === 1) {
    //         // إذا كان هناك root واحد فقط
    //         $root = $roots->first();
    //         if ($root && isset($nodes[$root->id])) {
    //             $treeStructure = $nodes[$root->id];
    //         } else {
    //             // إنشاء root افتراضي إذا لم يوجد
    //             $treeStructure = [
    //                 'text' => [
    //                     'name' => $tree->family_name ?? 'العائلة',
    //                     'relation' => 'family',
    //                 ],
    //                 'name' => $tree->family_name ?? 'العائلة',
    //                 'relation' => 'family',
    //                 'gender' => null,
    //                 'children' => []
    //             ];
    //         }
    //     } else {
    //         // إذا لم يوجد أي roots، أنشئ root افتراضي
    //         $treeStructure = [
    //             'text' => [
    //                 'name' => $tree->family_name ?? 'العائلة',
    //                 'relation' => 'family',
    //             ],
    //             'name' => $tree->family_name ?? 'العائلة',
    //             'relation' => 'family',
    //             'gender' => null,
    //             'children' => array_values($nodes)
    //         ];
    //     }

    //     return response()->json([
    //         'template' => $tree->template,
    //         'tree' => $treeStructure
    //     ]);
    // }


    public function getFamilyTreeNodesById($treeId)
    {
        // جلب الشجرة مع الـ template
        $tree = FamilyTree::with('template')->find($treeId);

        if (!$tree) {
            return response()->json(['message' => 'لا توجد شجرة بهذا المعرف'], 404);
        }

        // جلب جميع الأعضاء المرتبطين بالشجرة
        $members = FamilyDataMember::with([
            'fatherRelation.father',
            'motherRelation.mother',
            'childrenRelations.child',
        ])->where('family_tree_id', $tree->id)->get();

        $nodes = [];
        $partners = []; // لتخزين الأزواج المستنتجين

        foreach ($members as $member) {
            $node = [
                'id' => $member->id,
                'name' => $member->name,
                'relation' => $member->relation,
                'status' => $member->status ?? 'unknown',
                'birth_date' => $member->birth_date ?? null,
                'phone_number' => $member->phone_number ?? null,
                'profile_picture' => $member->profile_picture ? asset('storage/' . $member->profile_picture) : null,
                'gender' => ($member->relation == 'father' || $member->relation == 'son') ? 'male' : 'female',
                'fid' => optional($member->fatherRelation)->father?->id,
                'mid' => optional($member->motherRelation)->mother?->id,
                'pids' => [],
            ];


            $nodes[$member->id] = $node;

            // استنتاج الأزواج من الأب والأم
            if (!empty($node['fid']) && !empty($node['mid'])) {
                $fid = $node['fid'];
                $mid = $node['mid'];
                $key = $fid < $mid ? "{$fid}-{$mid}" : "{$mid}-{$fid}";
                if (!isset($partners[$key])) {
                    $partners[$key] = [$fid, $mid];
                }
            }
        }

        // إضافة pids للأزواج المستنتجين
        foreach ($partners as [$fid, $mid]) {
            if (isset($nodes[$fid])) $nodes[$fid]['pids'][] = $mid;
            if (isset($nodes[$mid])) $nodes[$mid]['pids'][] = $fid;
        }

        return response()->json([
            'tree_name' => $tree->tree_name,
            'template_id' => $tree->template_id,
            'nodes' => array_values($nodes)
        ]);
    }



    public function getFamilyTreeNodes()
    {
        $tree = FamilyTree::with('template')
            ->where('user_id', Auth::id())
            ->first();

        if (!$tree) {
            return response()->json(['message' => 'لا توجد شجرة'], 404);
        }

        $members = FamilyDataMember::with([
            'fatherRelation.father',
            'motherRelation.mother',
            'childrenRelations.child'
        ])->where('family_tree_id', $tree->id)->get();

        $nodes = [];
        $partners = []; // علشان نخزن الأزواج المستنتجين

        foreach ($members as $member) {
            $gender = ($member->relation == 'father' || $member->relation == 'son') ? 'male' : 'female';

            // هنا نعرض الرجالة فقط
            if ($gender !== 'male') {
                continue;
            }

            $node = [
                'id' => $member->id,
                'name' => $member->name,
                'relation' => $member->relation,
                'status' => $member->status ?? 'unknown',
                'birth_date' => $member->birth_date ?? null,
                'phone_number' => $member->phone_number ?? null,
                'profile_picture' => $member->profile_picture ? asset('storage/' . $member->profile_picture) : null,
                'gender' => $gender,
            ];

            // الأب
            if ($member->fatherRelation && $member->fatherRelation->father) {
                $node['fid'] = $member->fatherRelation->father->id;
            }

            // الأم
            if ($member->motherRelation && $member->motherRelation->mother) {
                $node['mid'] = $member->motherRelation->mother->id;
            }

            $nodes[$member->id] = $node;

            // استنتاج الأزواج من الأطفال
            if (!empty($node['fid']) && !empty($node['mid'])) {
                $fid = $node['fid'];
                $mid = $node['mid'];

                // تأكد إننا ما نكررش نفس الزوجين
                $key = $fid < $mid ? "{$fid}-{$mid}" : "{$mid}-{$fid}";
                if (!isset($partners[$key])) {
                    $partners[$key] = [$fid, $mid];
                }
            }
        }

        // دلوقتي نضيف pids للـ nodes
        foreach ($partners as [$fid, $mid]) {
            if (isset($nodes[$fid])) {
                $nodes[$fid]['pids'][] = $mid;
            }
            if (isset($nodes[$mid])) {
                $nodes[$mid]['pids'][] = $fid;
            }
        }

        return response()->json([
            'tree_name'  => $tree->tree_name,
            'template_id'  => $tree->template_id,
            'nodes' => array_values($nodes)
        ]);
    }


    public function update(Request $request, $id)
    {
        $tree = FamilyTree::where('user_id', Auth::id())->first();
        if (!$tree) return response()->json(['message' => 'لا توجد شجرة'], 404);

        $member = FamilyDataMember::where('family_tree_id', $tree->id)
            ->where('id', $id)
            ->firstOrFail();

        $requestData = $request->all();

        // تنظيف father_id
        if (empty($requestData['father_id']) || in_array($requestData['father_id'], ['', '0', 0])) {
            unset($requestData['father_id']);
        } else {
            $requestData['father_id'] = (int) $requestData['father_id'];
        }

        // تنظيف mother_id
        if (empty($requestData['mother_id']) || in_array($requestData['mother_id'], ['', '0', 0])) {
            unset($requestData['mother_id']);
        } else {
            $requestData['mother_id'] = (int) $requestData['mother_id'];
        }

        $data = validator($requestData, [
            'relation' => 'sometimes|string',
            'name' => 'sometimes|string|max:255',
            'job' => 'nullable|string',
            'status' => 'sometimes|in:alive,deceased',
            'birth_date' => 'nullable|date',
            'marital_status' => 'nullable|in:single,married',
            'phone_number' => 'nullable|string',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:10240',
            'father_id' => 'nullable|integer',
            'mother_id' => 'nullable|integer',
        ])->validate();

        if ($request->hasFile('profile_picture')) {
            $data['profile_picture'] = $request->file('profile_picture')
                ->store('family_pictures', 'public');
        }

        // ✅ لو غيرنا relation من "son" إلى "father"، نحتفظ بعلاقته كابن
        $oldRelation = $member->relation;
        $member->update($data);

        // ✅ فقط لو هو ابن أو بنت، نحدّث علاقة الأب والأم
        if (in_array($data['relation'] ?? $oldRelation, ['son', 'daughter'])) {
            $fatherId = $data['father_id'] ?? $member->fatherRelation->father_id ?? null;
            $motherId = $data['mother_id'] ?? $member->motherRelation->mother_id ?? null;

            FamilyRelation::updateOrCreate(
                ['child_id' => $member->id],
                [
                    'father_id' => $fatherId,
                    'mother_id' => $motherId,
                ]
            );
        }

        // ✅ في المستقبل، لما يضيف أولاد لهذا العضو، 
        // سيُسجّل تلقائيًا كـ father_id في FamilyRelation من خلال أكواد الإضافة.

        return response()->json([
            'message' => 'تم تحديث بيانات الفرد بنجاح',
            'member' => $member
        ]);
    }



    // 🟢 حذف فرد
    public function destroy($id)
    {
        $tree = FamilyTree::where('user_id', Auth::id())->first();
        if (!$tree) {
            return response()->json(['message' => 'لا توجد شجرة مرتبطة بالمستخدم الحالي'], 404);
        }

        $member = FamilyDataMember::where('family_tree_id', $tree->id)->findOrFail($id);

        // حذف العلاقات المرتبطة
        FamilyRelation::where('father_id', $member->id)
            ->orWhere('mother_id', $member->id)
            ->orWhere('child_id', $member->id)
            ->delete();

        // حذف الفرد
        $member->delete();

        return response()->json(['message' => 'تم حذف الفرد بنجاح']);
    }
}
