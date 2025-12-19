<?php

use Illuminate\Http\Request;
use App\Http\Controllers\PasswordController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OtpLoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AnalyticsReportController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\SubscribersController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\API\Admin\MessageController;
use App\Http\Controllers\MonthlyRevenueController;
use App\Http\Controllers\NewUsersSubscriptionsController;
use App\Http\Controllers\TreeTemplateController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\FamilyOverviewController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\SettingController;
use App\Models\Subscription;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\TransactionsController;
use App\Http\Controllers\PaymentsController;
use App\Http\Controllers\SecureDataController;
use App\Http\Controllers\ContactController;


// ==============================================

use App\Http\Controllers\FamilyTreeController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\FatherController;
use App\Http\Controllers\MotherController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\NotificationSettingController;
use Faker\Provider\ar_SA\Payment;
use App\Http\Controllers\FamilyDataMemberController;
use App\Http\Controllers\TreeCreatorEventController;
use App\Http\Controllers\OccasionController;
use App\Http\Controllers\OccasionDetailController;
use App\Http\Controllers\CreatorNewsController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\FamilyMapLocationController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\VisitorController;
use App\Models\FamilyDataMember;


use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DomainController;


Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);


Route::get('/payment/callback', [PaymentController::class, 'handleCallback']);




// password reset with otp
Route::post('/password/request-reset', [OtpLoginController::class, 'requestOtp']);
Route::post('/password/verify-otp-only', [OtpLoginController::class, 'verifyOtp']);

// google register & login

Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

// password reset

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/change-password', [PasswordController::class, 'update'])->name('password.update');
});


// Notifications Route
    Route::post('/admin/send-notification', [AdminNotificationController::class, 'send'])
        ->name('admin.send.notification');


///Domain APIs
Route::middleware('auth:sanctum')->prefix('domain')->group(function () {
    // التحقق من توفر الدومين
    Route::get('/check-availability', [DomainController::class, 'checkAvailability']);
    
    // الحصول على سعر الدومين
    Route::get('/price', [DomainController::class, 'getPrice']);
    
    // حفظ طلب الدومين
    Route::post('/orders', [DomainController::class, 'storeOrder']);
    
    // الحصول على طلبات المستخدم
    Route::get('/orders', [DomainController::class, 'getUserOrders']);
    
    // التحقق من صحة الكوبون
    Route::post('/validate-coupon', [DomainController::class, 'validateCoupon']);
    
    // حفظ الدومين (للتوافق مع الكود القديم)
    Route::post('/connect', [DomainController::class, 'store']);
});



// ///////////////////////////////////////////////////////////////////////////////////////////

Route::prefix('secure-data')->group(function () {
    Route::post('/', [SecureDataController::class, 'store']); // تخزين البيانات
    Route::get('/{id}', [SecureDataController::class, 'show']); // عرض البيانات
});


// ***
// Admin
// ****

// logout
Route::post('/logout', function (Request $request) {
    $request->user()->tokens()->delete(); // يمسح كل التوكنات
    return response()->json(['message' => 'تم تسجيل الخروج بنجاح']);
})->middleware('auth:sanctum');


// admin view subscribers count

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/subscribers', [SubscribersController::class, 'countSubscribers']);
});

// admin view plans count

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/plans/count', [PlanController::class, 'countPlans']);
});

// admin view users count

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/recent-users/count', [UserController::class, 'recentUsersCount']);
});

// admin view totel payments

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/revenue', [SubscriptionController::class, 'totalRevenue']);
});

// admin view Monthly Revenue

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/monthly-revenue', [MonthlyRevenueController::class, 'monthlyRevenue']);
    Route::get('/monthly-new-users', [NewUsersSubscriptionsController::class, 'index']);
    Route::get('/monthly-new-users/count', [NewUsersSubscriptionsController::class, 'countSubscribersInPeriod']);
});


// Message Routes

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // replay to complaint
    Route::post('/replay/{id}', [ComplaintController::class, 'reply']);
    // =====================================================================
    Route::get('/messages/{id}', [ComplaintController::class, 'show']);
    Route::post('/messages/{id}', [ComplaintController::class, 'updateStatus']);
    Route::delete('/messages/{id}', [ComplaintController::class, 'destroy']);
});
    Route::get('/messages', [ComplaintController::class, 'index']);


// ================================================================================

// compliments routes

// show replay
Route::middleware('auth:sanctum')->get('/show-replay/{id}', [ComplaintController::class, 'showReply']);
// view complaint
Route::middleware('auth:sanctum')->get('/view/{id}', [ComplaintController::class, 'view']);
Route::middleware('auth:sanctum')->get('/view-all/{id}', [ComplaintController::class, 'viewAll']);


// ==================================================================================

// Family Tree

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/tree-templates', [TreeTemplateController::class, 'index']);

    Route::get('/activities', [ActivityController::class, 'index']);
    Route::put('/activities/{activity}', [ActivityController::class, 'update']);
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->post('/activities', [ActivityController::class, 'store']);

///////////////////////////////////////////////////////////////

// Users Management Routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/show_users', [UserController::class, 'allUsers']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/new/last-7-days', [UserController::class, 'newUsersLast7Days']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
});

// Routes for normal users - protected by checkuser
Route::middleware(['auth:sanctum', 'checkuser'])->group(function () {
    Route::put('/profile', [UserController::class, 'update']);
});



// invitation

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/invitations')->group(function () {
    Route::get('/', [InvitationController::class, 'index']);
    Route::post('/', [InvitationController::class, 'store']);
    Route::delete('/{id}', [InvitationController::class, 'destroy']);
    Route::put('/{id}/status', [InvitationController::class, 'updateStatus']);
    Route::get('/stats', [InvitationController::class, 'stats']); // 📊 إحصائيات
    Route::put('/disable-family/{family_id}', [InvitationController::class, 'disableFamilyInvitations']);
});


// Plans

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/count', [PlanController::class, 'countPlans']);
    Route::get('/plans', [PlanController::class, 'index']);
    Route::post('/plans', [PlanController::class, 'store']);
    Route::get('/plans/show', [PlanController::class, 'show']);
    Route::put('/plans/{plans}', [PlanController::class, 'update']);
    Route::delete('/plans/{plans}', [PlanController::class, 'destroy']);
});

// Subscriptions

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::put('/subscriptions/{subscription}', [SubscriptionController::class, 'update']);
    Route::delete('/subscriptions/{subscription}', [SubscriptionController::class, 'destroy']);
    Route::get('/subscriptions/revenue', [SubscriptionController::class, 'totalRevenue']);
    Route::get('/subscriptions/count', [SubscriptionController::class, 'totalSubscribers']);
    Route::get('/subscriptions/monthly-revenue', [SubscriptionController::class, 'monthlyRevenues']);
    Route::get('/enrollments', [SubscriptionController::class, 'getEnrollmentStats']);
});


Route::post('/subscriptions', [SubscriptionController::class, 'store'])->middleware('auth:sanctum');
Route::get('/viewPayments', [SubscriptionController::class, 'viewPayments'])->middleware('auth:sanctum');



Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::patch('/subscriptions/{subscription}/toggle-renew', function (Subscription $subscription) {
        $subscription->auto_renew = !$subscription->auto_renew;
        $subscription->save();

        return response()->json(['message' => 'تم تحديث حالة التجديد التلقائي']);
    });
});

// Settings

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/settings/update', [SettingController::class, 'update']);
});

Route::middleware('auth:sanctum')->get('/admin/settings', [SettingController::class, 'index']);


// Payments

// Coupons
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/coupons', [CouponController::class, 'index']);
    Route::post('/coupons', [CouponController::class, 'store']);
    Route::put('/coupons/{id}', [CouponController::class, 'update']);
    // routes/api.php
});

Route::post('/check-coupon', [CouponController::class, 'check']);


// Promotions
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/promotions', [PromotionController::class, 'store']);
    Route::put('/promotions/{id}', [PromotionController::class, 'update']);
});

Route::get('/admin/promotions', [PromotionController::class, 'index']);


// transactions
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/transactions', [TransactionsController::class, 'store']);
    Route::get('/transactions/{id}', [TransactionsController::class, 'show']);
    Route::put('/transactions/{id}', [TransactionsController::class, 'update']);
});
Route::get('/admin/transactions', [TransactionsController::class, 'index']);


// analytics
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/visitors', [VisitorController::class, 'index']);
    Route::get('/analytics/export-pdf', [AnalyticsReportController::class, 'exportPdf']);
    Route::get('/visitors/country', [VisitorController::class, 'byCountry']);
});

// ====================================================================================

// *****`
// Tree tree_creator
// *****`

// Start

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/family-trees', [FamilyTreeController::class, 'index']);
    Route::post('/family-trees', [FamilyTreeController::class, 'store']);
    Route::put('/family-trees/{id}', [FamilyTreeController::class, 'update']);
    Route::delete('/family-trees/{id}', [FamilyTreeController::class, 'destroy']);
});

// Home

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/family_tree', [App\Http\Controllers\SubscriberHomeController::class, 'templateshow']);
    Route::get('/family_occasions', [OccasionController::class, 'index']);
});

// Treeeeeeee

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/family-tree', [App\Http\Controllers\FamilyTreeController::class, 'index']);
    Route::post('/family-tree', [App\Http\Controllers\FamilyTreeController::class, 'store']);
    Route::delete('/family-tree/{id}', [App\Http\Controllers\FamilyTreeController::class, 'destroy']);
    Route::post('/family-tree/{id}', [App\Http\Controllers\FamilyTreeController::class, 'update']);
    Route::put('/family-tree/update-template', [App\Http\Controllers\FamilyTreeController::class, 'updateTemplateId']);
});

Route::middleware('auth:sanctum')->get('/families', [App\Http\Controllers\FamilyTreeController::class, 'getAllTrees']);
Route::middleware('auth:sanctum')->get('/families/{id}', [App\Http\Controllers\FamilyTreeController::class, 'show']);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Tree Data

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/family-members-data', [FamilyDataMemberController::class, 'index']);
    Route::get('/family-parents', [FamilyDataMemberController::class, 'getParents']);
    Route::get('/family-tree-design', [FamilyDataMemberController::class, 'getTreeData']);
    Route::post('/family-members-data', [FamilyDataMemberController::class, 'store']);
    Route::put('/family-members-data/{id}', [FamilyDataMemberController::class, 'update']);
    Route::delete('/family-members-data/{id}', [FamilyDataMemberController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'tree_creator'])->get('/test-tree', [FamilyDataMemberController::class, 'getFamilyTreeNodes']);
// routes/api.php
Route::get('/tree-nodes/{treeId}', [FamilyDataMemberController::class, 'getFamilyTreeNodesById']);



/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Compliments

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
});

// Notifications Settings

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/notifications', [NotificationSettingController::class, 'index']);
    Route::post('/notifications', [NotificationSettingController::class, 'update']);
});

// Payments

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/payments', [PaymentsController::class, 'index']);
    Route::post('/payments/cards', [PaymentsController::class, 'storeCard']);
    Route::delete('/payments/cards/{id}', [PaymentsController::class, 'destroyCard']);
});

// ////////////////////////////////////////////////////////////////////////////////////////////////

// Tree Events

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/tree-creator-events', [TreeCreatorEventController::class, 'index']);
    Route::get('/tree-creator-events/past', [TreeCreatorEventController::class, 'pastEvents']);
});

// add new Event

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/occasions/{id}', [OccasionController::class, 'index']);
    Route::post('/occasions', [OccasionController::class, 'store']);
    Route::put('/occasions/{id}', [OccasionController::class, 'update']);
    Route::delete('/occasions/{id}', [OccasionController::class, 'destroy']);
});

// Events Details

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/occasion-details/{id}', [OccasionDetailController::class, 'show']);
});

Route::middleware('auth:sanctum')->get('/occasions', [OccasionController::class, 'index']);

// ////////////////////////////////////////////////////////////////////////////////////////////////

// News

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::post('/news', [CreatorNewsController::class, 'store']);
    Route::put('/news/{id}', [CreatorNewsController::class, 'update']);
    Route::delete('/news/{id}', [CreatorNewsController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->get('/news', [CreatorNewsController::class, 'index']);
Route::middleware('auth:sanctum')->get('/news_show', [CreatorNewsController::class, 'newsshow']);
Route::middleware('auth:sanctum')->get('/news/{id}', [CreatorNewsController::class, 'show']);


// News Comments

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/news/{id}/details', [App\Http\Controllers\NewsDetailController::class, 'show']);
    Route::post('/comments/{id}', [App\Http\Controllers\NewsDetailController::class, 'addComment']);
    Route::delete('/news/comments/{id}', [App\Http\Controllers\NewsDetailController::class, 'deleteComment']);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////

// Family Map

Route::middleware('auth:sanctum')->get('/family-map', [FamilyMapLocationController::class, 'show']);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Messages

Route::middleware(['auth:sanctum', 'tree_creator'])->group(function () {
    Route::post('/messages', [ChatController::class, 'sendMessage']);
    Route::get('/messages/{receiver_id}', [ChatController::class, 'fetchMessages']);
});


// Add User Data ---> settings

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/user-profiles/{id}', [UserController::class, 'updateCurrentUser']);
    Route::delete('/user-profiles/{id}', [UserController::class, 'destroy']);
    Route::get('/user-profiles/{id}', [UserController::class, 'getCurrentUser']);
});



//////////////////////////////////////////////////////////////////////////////////////////////////////

// Requests joinining

Route::middleware(['auth:sanctum', 'tree_creator'])->prefix('tree_creator')->group(function () {
    Route::get('/request', [RequestController::class, 'index']);
    Route::put('/request/{activity}', [RequestController::class, 'update']);
    Route::delete('/request/{id}', [RequestController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->post('/trees', [RequestController::class, 'store']);
Route::middleware('auth:sanctum')->post('/contact-creator', [RequestController::class, 'contact']);
Route::middleware('auth:sanctum')->get('/view-tree', [RequestController::class, 'viewtree']);



//////////////////////////////////////////////////////////////////////////////////////////////////////

// ***** /

// Admin Assistant

//***** */

Route::post('/invite/accept', [InvitationController::class, 'accept']);

Route::middleware(['auth:sanctum', 'admin_assistant'])->prefix('admin_assistant')->group(function () {
    // users
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    // messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages/{id}', [MessageController::class, 'updateStatus']);
    // tree manage
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::put('/activities/{activity}', [ActivityController::class, 'update']);
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);

    Route::get('/settings', [SettingController::class, 'index']);
});


// //////////////////////////////

// contact form

Route::post('/contact', [ContactController::class, 'send']);


// /////////////////////////////////////////////

// routes/api.php

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/save-payment', [PaymentController::class, 'store']);
});

Route::post('/payment/callback', [PaymentController::class, 'callback']);

// /////////////////////////////////////////////
// upgrade role by plan
Route::post('/upgrade-role', [ActivityController::class, 'upgradeRoleIfEligible'])->middleware('auth:sanctum');
