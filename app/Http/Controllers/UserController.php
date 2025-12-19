<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\FamilyTree;
use App\Helpers\ImageHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserController extends Controller
{
    public function newUsersLast7Days()
    {
        $fromDate = Carbon::now()->subDays(7);

        $count = User::where('created_at', '>=', $fromDate)->count();

        return response()->json([
            'message' => 'عدد المستخدمين الجدد خلال آخر 7 أيام',
            'new_users_count' => $count,
        ]);
    }

    public function allUsers()
    {
        $users = User::all();
        return response()->json($users);
    }

    private function uploadProfileImage($file)
    {
        return $file ? $file->store('profile_picture', 'public') : null;
    }

    private function createUser(array $data)
    {
        if (isset($data['first_name']) && isset($data['last_name'])) {
            $data['name'] = $data['first_name'] . ' ' . $data['last_name'];
        }

        return User::create([
            'name'            => $data['name'],
            'email'           => $data['email'] ?? Str::slug($data['name']) . '@example.com',
            'password'        => isset($data['password']) ? Hash::make($data['password']) : null,
            'role'            => $data['role'] ?? 'user',
            'phone'           => $data['phone'] ?? null,
            'job'             => $data['job'] ?? null,
            'status'          => $data['status'] ?? 'active',
            'membership_type' => $data['membership_type'] ?? 'member',
            'family_tree_id'       => $data['family_tree_id'] ?? null,
            'birth_date'      => $data['birth_date'] ?? null,
            'social_status'   => $data['social_status'] ?? null,
            'life_status'     => $data['life_status'] ?? 'alive',
            'profile_picture'   => $data['profile_picture'] ?? null,
        ]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'name'           => 'required|string|max:255',
            'email'          => 'required|string|email|max:255|unique:users',
            'password'       => 'required|string|min:8|confirmed',
            'role'           => 'in:user,admin,tree_creator',
        ]);

        if ($request->hasFile('profile_picture')) {
            $data['profile_picture'] = $request->file('profile_picture')->store('profile_picture', 'public');
        }

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        $tree = null;
        if ($user->role === 'tree_creator') {
            $tree = FamilyTree::create([
                'user_id'     => $user->id,
                'template_id' => 1,
                'tree_name'   => $user->name . "'s Family Tree",
                'is_default'  => true,
            ]);
        }

        return response()->json([
            'message' => 'تم التسجيل بنجاح',
            'user_id' => $user->id,
            'user'    => $user,
            'tree'    => $tree
        ], 201);
    }


    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'بيانات الدخول غير صحيحة'], 401);
        }

        $user = Auth::user();
        $hasTreeData = null;

        switch ($user->role) {
            case 'tree_creator':
                $treeExists = \App\Models\FamilyTree::where('user_id', $user->id)->exists();

                if ($treeExists) {
                    $hasTreeData = true;
                } else {
                    // التحقق إذا كانت شجرة محذوفة سابقاً
                    $hadTreeBefore = \App\Models\FamilyTree::where('user_id', $user->id)->exists();

                    if ($hadTreeBefore) {
                        Auth::logout();
                        return response()->json([
                            'message' => 'تم حذف الشجرة الخاصة بك، لا يمكنك تسجيل الدخول'
                        ], 403);
                    } else {
                        $hasTreeData = false;
                    }
                }
                break;

            case 'family_member':
                $memberExists = \App\Models\FamilyDataMember::where('user_id', $user->id)->exists();

                if (!$memberExists) {
                    Auth::logout();
                    return response()->json([
                        'message' => 'تم حذفك من الشجرة، لا يمكنك تسجيل الدخول'
                    ], 403);
                }
                $hasTreeData = true;
                break;

            case 'user':
                // يسمح بالدخول عادي
                $hasTreeData = false;
                break;

            case 'admin':
            case 'admin_assistant':
                // السماح بالدخول، يروحوا لصفحة Admin بحسب الدور
                $hasTreeData = false;
                break;

            default:
                Auth::logout();
                return response()->json(['message' => 'دور المستخدم غير معروف'], 403);
        }

        $token = $user->createToken('API Token', [$user->role])->plainTextToken;

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'token' => $token,
            'token_type' => 'Bearer',
            'user_id' => $user->id,
            'user' => $user,
            'role' => $user->role,
            'hasTreeData' => $hasTreeData
        ]);
    }



    public function recentUsersCount()
    {
        $count = User::where('created_at', '>=', Carbon::now()->subDays(7))->count();

        return response()->json([
            'message' => 'عدد المستخدمين الجدد خلال آخر 7 أيام',
            'count' => $count
        ]);
    }

    public function index(Request $request)
    {
        $query = User::with('familyTrees');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%")

                    ->orWhereHas('family', function ($q2) use ($search) {
                        $q2->where('name', 'LIKE', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('membership_type')) {
            $query->where('membership_type', $request->membership_type);
        }

        if ($request->filled('family_tree_id')) {
            $query->where('family_tree_id', $request->family_tree_id);
        }

        return response()->json($query->paginate(6));
    }

    public function show(User $user)
    {
        $user->load(['familyTrees.familyDataMembers', 'subscriptions']);
        return response()->json($user);
    }


    public function updateStatus(Request $request, User $user)
    {
        $request->validate([
            'status' => 'required|in:active,suspended,banned',
        ]);

        $user->status = $request->status;

        if ($request->status === 'banned') {
            // المستخدم محظور: احذف كل الـ tokens علشان يخرج من النظام نهائيًا
            $user->tokens()->delete();
        } elseif ($request->status === 'suspended') {
            // المستخدم موقوف مؤقتًا: نلغي الجلسات الحالية فقط
            $user->tokens()->delete();
        } elseif ($request->status === 'active') {
            // رجع للحالة النشطة: ما فيش حاجة إضافية نعملها
        }

        $user->save();

        return response()->json([
            'message' => 'تم تحديث حالة المستخدم بنجاح',
            'status' => $user->status
        ]);
    }


    public function update(Request $request, User $user)
    {
        $validated = $request->only(['name', 'phone', 'job', 'membership_type', 'status', 'family_tree_id', 'tree_name']);
        if ($request->hasFile('profile_picture')) {
            $validated['profile_picture'] = $this->uploadProfileImage($request->file('profile_picture'));
        }

        $user->update($validated);

        return response()->json(['message' => 'تم تحديث بيانات المستخدم بنجاح']);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'تم حذف المستخدم بنجاح']);
    }


    public function getCurrentUser(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'message' => 'المستخدم الحالي',
            'user'    => $user
        ]);
    }

    // ✅ تحديث بيانات المستخدم الحالي
    public function updateCurrentUser(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'job' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'social_status' => 'nullable|in:single,married',
            'life_status' => 'nullable|in:deceased,alive',
            'phone' => 'nullable|string|max:20',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:10240'
        ]);

        if ($request->hasFile('profile_picture')) {
            $validated['profile_picture'] = $request->file('profile_picture')->store('profile_picture', 'public');
        }

        $user->update($validated);

        return response()->json([
            'message' => 'تم تحديث الملف الشخصي بنجاح',
            'user' => $user
        ]);
    }

    public function currentUser(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'name' => $user->name,
            'job' => $user->job,
            'birth_date' => $user->birth_date,
            'phone' => $user->phone,
            'social_status' => $user->social_status,
            'life_status' => $user->life_status,
            'profile_picture_url' => $user->profile_picture ? '/storage/' . $user->profile_picture : null,
        ]);
    }
}
