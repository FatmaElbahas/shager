<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlansTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('plans')->insert([
            [
                'plan' => 'primary',
                'price' => 11,
                'duration_in_days' => 30,
                'description' => 'Up to 100 members in the family tree , Upload family photos and recordings , Advanced privacy settings',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'plan' => 'custom',
                'price' => 30,
                'duration_in_days' => 365,
                'description' => 'Up to 1000 members in the family tree , Upload family photos and recordings , Advanced privacy settings , Share the tree with family , Collaborate with family members on editing',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'plan' => 'advanced',
                'price' => 20,
                'duration_in_days' => 90,
                'description' => 'Up to 500 members in the family tree , Upload family photos and recordings , Advanced privacy settings , Share the tree with family',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'plan' => 'featured',
                'price' => 30,
                'duration_in_days' => 365,
                'description' => 'Up to 1000 members in the family tree , Upload family photos and recordings , Advanced privacy settings , Share the tree with family , Collaborate with family members on editing',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
