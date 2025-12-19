<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TreeTemplatesTableSeeder extends Seeder {
    /**
    * Run the database seeds.
    */

    public function run(): void {
        DB::table( 'tree_templates' )->insert( [
            [
                'name' => 'template 1',
                'description' => 'Tree with a circular design and dense green leaves',
                'image' => 'images/Template 1.png',
                'is_default' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 2',
                'description' => 'Tree with a different design, wide trunk, and scattered leaves',
                'image' => 'images/Template 2.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 3',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 3.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 4',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 4.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 5',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 5.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 6',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 6.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 7',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 7.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 8',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 8.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 9',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 9.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 10',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 10.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 11',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 11.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 12',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 12.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 13',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 13.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 14',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 14.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'template 15',
                'description' => 'Tree with a tall trunk and sparse leaves, symbolizing growth and resilience',
                'image' => 'images/Template 15.png',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ] );
    }
}
