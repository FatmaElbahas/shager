<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Plan;
use App\Models\FamilyTree;
use Carbon\Carbon;

class CreateSubscriptionForUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:create {email} {--plan=advanced}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'إنشاء اشتراك نشط لمستخدم معين';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $planType = $this->option('plan'); // primary, advanced, custom, featured

        // البحث عن المستخدم
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("المستخدم بالبريد الإلكتروني {$email} غير موجود!");
            return 1;
        }

        $this->info("تم العثور على المستخدم: {$user->name} ({$user->email})");

        // البحث عن الخطة
        $plan = Plan::where('plan', $planType)->first();

        if (!$plan) {
            $this->error("الخطة '{$planType}' غير موجودة!");
            $this->info("الخطط المتاحة: primary, advanced, custom, featured");
            return 1;
        }

        $this->info("تم العثور على الخطة: {$plan->plan} (السعر: {$plan->price})");

        // التأكد من وجود family_tree أو إنشاء واحد
        $familyTree = FamilyTree::where('user_id', $user->id)->first();

        if (!$familyTree) {
            $this->info("لا توجد شجرة عائلة للمستخدم. جاري إنشاء شجرة جديدة...");
            $familyTree = FamilyTree::create([
                'user_id' => $user->id,
                'template_id' => 1, // القالب الافتراضي
                'tree_name' => $user->name . "'s Family Tree",
                'is_default' => true,
            ]);
            $this->info("تم إنشاء شجرة عائلة جديدة (ID: {$familyTree->id})");
        } else {
            $this->info("تم العثور على شجرة عائلة موجودة (ID: {$familyTree->id})");
        }

        // التحقق من وجود اشتراك نشط
        $existingSubscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if ($existingSubscription) {
            $this->warn("المستخدم لديه بالفعل اشتراك نشط!");
            if (!$this->confirm('هل تريد تحديث الاشتراك الحالي؟', false)) {
                $this->info("تم إلغاء العملية.");
                return 0;
            }
            // تحديث الاشتراك الحالي
            $existingSubscription->update([
                'plan_id' => $plan->id,
                'status' => 'active',
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_in_days ?? 365),
                'auto_renew' => true,
            ]);
            $this->info("تم تحديث الاشتراك الحالي بنجاح!");
        } else {
            // إنشاء اشتراك جديد
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'family_tree_id' => $familyTree->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_in_days ?? 365),
                'status' => 'active',
                'auto_renew' => true,
            ]);
            $this->info("تم إنشاء اشتراك جديد بنجاح! (ID: {$subscription->id})");
        }

        // تحديث role إلى tree_creator إذا لم يكن كذلك
        if ($user->role !== 'tree_creator') {
            $user->update(['role' => 'tree_creator']);
            $this->info("تم تحديث دور المستخدم إلى 'tree_creator'");
        } else {
            $this->info("المستخدم لديه بالفعل دور 'tree_creator'");
        }

        $this->info("\n✅ تم إكمال العملية بنجاح!");
        $this->info("المستخدم {$user->name} الآن يمكنه إضافة أفراد إلى الشجرة.");

        return 0;
    }
}
