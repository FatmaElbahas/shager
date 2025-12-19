<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FamilyTreeController extends Controller
{
    public function index()
    {
        $familyData = [
            'id' => 'root',
            'name' => 'محمد',
            'age' => 'الجد',
            'children' => [
                // Add your family data here
            ]
        ];
        
        return view('family-tree', compact('familyData'));
    }
}