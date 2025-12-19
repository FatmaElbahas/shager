<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['name' => 'Add up to 50 members', 'key' => 'add_50_members'],
            ['name' => 'Add up to 500 members', 'key' => 'add_500_members'],
            ['name' => 'Add up to 1000 members', 'key' => 'add_1000_members'],
            ['name' => 'Unlimited members', 'key' => 'add_unlimited_members'],
            ['name' => 'Upload news and occasions', 'key' => 'upload_media'],
            ['name' => 'Domain Reservation', 'key' => 'domain_reservation'],
            ['name' => 'Access Paid Templates', 'key' => 'access_paid_templates'],
            ['name' => 'Access Free Templates', 'key' => 'access_free_templates'],
            ['name' => 'Add map locations', 'key' => 'add_location'],
            ['name' => 'Just Approving', 'key' => 'just_approving'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['key' => $permission['key']], // الشرط (ما يتكررش)
                [
                    'name' => $permission['name'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
