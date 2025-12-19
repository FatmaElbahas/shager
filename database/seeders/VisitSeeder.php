<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Visit;
use Carbon\Carbon;

class VisitSeeder extends Seeder
{
    public function run()
    {
        $countries = ['Egypt', 'USA', 'France', 'Germany', 'India', 'Canada'];

        for ($i = 0; $i < 50; $i++) {
            Visit::create([
                'ip' => '192.168.0.' . rand(1, 255),
                'user_agent' => 'TestAgent',
                'country' => $countries[array_rand($countries)],
                'created_at' => Carbon::today()->subDays(rand(0, 29))->addMinutes(rand(0, 1440)),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
