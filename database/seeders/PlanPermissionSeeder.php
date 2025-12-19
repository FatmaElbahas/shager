<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;
use App\Models\Permission;
use App\Models\TreeTemplate;

class PlanPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $templateId = TreeTemplate::first()->id;   // ← أهم سطر

        $primary = Plan::where('plan', 'primary')->first();
        $custom = Plan::where('plan', 'custom')->first();
        $advanced = Plan::where('plan', 'advanced')->first();
        $featured = Plan::where('plan', 'featured')->first();

        $add50Members = Permission::where('key', 'add_50_members')->first();
        $add500Members = Permission::where('key', 'add_500_members')->first();
        $add1000Members = Permission::where('key', 'add_1000_members')->first();
        $addUnlimitedMembers = Permission::where('key', 'add_unlimited_members')->first();
        $uploadMedia = Permission::where('key', 'upload_media')->first();
        $domain = Permission::where('key', 'domain_reservation')->first();
        $paidTemplates = Permission::where('key', 'access_paid_templates')->first();
        $freeTemplates = Permission::where('key', 'access_free_templates')->first();
        $addLocation = Permission::where('key', 'add_location')->first();
        $justApprovement = Permission::where('key', 'just_approving')->first();

        $primary->permissions()->sync([
            $add50Members->id => ['template_id' => $templateId],
            $uploadMedia->id => ['template_id' => $templateId],
            $freeTemplates->id => ['template_id' => $templateId],
        ]);

        $advanced->permissions()->sync([
            $add500Members->id => ['template_id' => $templateId],
            $uploadMedia->id => ['template_id' => $templateId],
            $paidTemplates->id => ['template_id' => $templateId],
            $justApprovement->id => ['template_id' => $templateId],
        ]);

        $custom->permissions()->sync([
            $add1000Members->id => ['template_id' => $templateId],
            $uploadMedia->id => ['template_id' => $templateId],
            $paidTemplates->id => ['template_id' => $templateId],
            $addLocation->id => ['template_id' => $templateId],
            $justApprovement->id => ['template_id' => $templateId],
        ]);

        $featured->permissions()->sync([
            $addUnlimitedMembers->id => ['template_id' => $templateId],
            $uploadMedia->id => ['template_id' => $templateId],
            $domain->id => ['template_id' => $templateId],
            $paidTemplates->id => ['template_id' => $templateId],
            $addLocation->id => ['template_id' => $templateId],
            $justApprovement->id => ['template_id' => $templateId],
        ]);
    }
}
