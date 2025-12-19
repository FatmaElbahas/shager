import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Family tree data from App.tsx
const familyData = {
  id: 'root',
  name: 'محمد',
  age: 'الجد',
  children: [
    // Right Side Branch (Low)
    {
      id: 'mosaad-branch',
      name: 'مسعد',
      age: '50',
      children: [
        { id: 'mohamed-sub', name: 'محمد', age: '25', children: [] }
      ]
    },
    // Left Side Branch (Low) - Kamal
    {
      id: 'kamal',
      name: 'كمال',
      age: '45',
      children: [
        { id: 'abubakr', name: 'ابوبكر', age: '20', children: [] },
        { id: 'hassan', name: 'حسن', age: '18', children: [] },
        { id: 'abdelaziz', name: 'عبدالعزيز', age: '15', children: [] },
      ]
    },
    // Left Side Branch (Middle) - Mohsen
    {
      id: 'mohsen',
      name: 'محسن',
      age: '55',
      children: [
        { id: 'hamza', name: 'حمزة', age: '30', children: [] },
        { id: 'oweiss', name: 'اويس', age: '28', children: [] },
        { id: 'tamim', name: 'تيم', age: '25', children: [] },
        { id: 'tamim2', name: 'تميم', age: '24', children: [] },
        { id: 'rajab', name: 'رجب', age: '22', children: [] },
        { id: 'jumaa', name: 'جمعه', age: '20', children: [] },
        { id: 'abdelnasser', name: 'عبدالناصر', age: '30', children: [] },
        { id: 'ibrahim', name: 'ابراهيم', age: '28', children: [] },
        { id: 'anwar', name: 'انور', age: '26', children: [] },
        { id: 'morsi', name: 'مرسي', age: '24', children: [] },
      ]
    },
    // Center Left Branch - Yassin
    {
      id: 'yassin',
      name: 'ياسين',
      age: '52',
      children: [
        { id: 'sofian', name: 'سفيان', age: '26', children: [] },
        { id: 'hesham', name: 'هشام', age: '24', children: [] },
        { id: 'khalil-sub', name: 'خليل', age: '22', children: [] },
        { id: 'essam', name: 'عصام', age: '20', children: [] },
        { id: 'karim-sub', name: 'كريم', age: '18', children: [] },
      ]
    },
    // Center Branch - Amr (Amro)
    {
      id: 'amr',
      name: 'عمرو',
      age: '50',
      children: [
        { id: 'yahya', name: 'يحيي', age: '21', children: [] },
        { id: 'kamel', name: 'كامل', age: '27', children: [] },
        { id: 'mahmoud-sub', name: 'محمود', age: '25', children: [] },
        { 
          id: 'abbas', 
          name: 'عباس', 
          age: '35', 
          children: [
            { id: 'salman', name: 'سلمان', age: '10', children: [] },
            { id: 'nasser', name: 'ناصر', age: '8', children: [] },
            { id: 'bilal', name: 'بلال', age: '6', children: [] },
            { id: 'ahmed', name: 'أحمد', age: '5', children: [] },
            { id: 'ismail', name: 'اسماعيل', age: '4', children: [] },
            { id: 'moamen', name: 'مؤمن', age: '12', children: [] },
            { id: 'khaled-sub', name: 'خالد', age: '11', children: [] },
            { id: 'ibrahim-sub', name: 'ابراهيم', age: '9', children: [] },
          ] 
        },
      ]
    },
    // Right Branch - Khalil
    {
      id: 'khalil',
      name: 'خليل',
      age: '48',
      children: [
        { id: 'karam', name: 'كرم', age: '20', children: [] },
        { id: 'khaled', name: 'خالد', age: '18', children: [] },
        { 
          id: 'salim', 
          name: 'سليم', 
          age: '25', 
          children: [
             { id: 'salim-sub', name: 'سليم', age: '5', children: [] },
             { id: 'mahmoud', name: 'محمود', age: '4', children: [] },
             { id: 'mortada', name: 'مرتضى', age: '3', children: [] },
             { id: 'ali', name: 'علي', age: '2', children: [] },
          ] 
        },
        { 
          id: 'omar-sub', 
          name: 'عمر', 
          age: '22', 
          children: [
            { id: 'seif', name: 'سيف', age: '5', children: [] },
            { id: 'mustafa', name: 'مصطفى', age: '4', children: [] },
            { id: 'karim-sub2', name: 'كريم', age: '2', children: [] },
          ] 
        },
      ]
    },
  ]
};

// Function to generate a Blade template for a family member
function generateBladeTemplate(member, level = 0) {
  const indent = '  '.repeat(level);
  let html = '';
  
  // Start the member div
  html += `${indent}<div class="family-member level-${level}" data-id="${member.id}">\n`;
  
  // Member info
  html += `${indent}  <div class="member-info">\n`;
  html += `${indent}    <h3>${member.name}</h3>\n`;
  html += `${indent}    <p class="age">${member.age}</p>\n`;
  html += `${indent}  </div>\n`;
  
  // Children container
  if (member.children && member.children.length > 0) {
    html += `${indent}  <div class="children">\n`;
    
    // Generate templates for each child
    member.children.forEach(child => {
      html += generateBladeTemplate(child, level + 1);
    });
    
    html += `${indent}  </div>\n`;
  }
  
  // Close the member div
  html += `${indent}</div>\n`;
  
  return html;
}

// Function to generate the main Blade layout
function generateMainBladeTemplate(data) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شجرة العائلة</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f7f5eb;
            margin: 0;
            padding: 20px;
        }
        
        .family-tree {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .family-member {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin: 10px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-width: 150px;
            text-align: center;
        }
        
        .family-member.level-0 {
            background-color: #d1fae5;
            border-color: #10b981;
            min-width: 200px;
        }
        
        .family-member.level-1 {
            background-color: #fef3c7;
            border-color: #f59e0b;
        }
        
        .family-member.level-2 {
            background-color: #dbeafe;
            border-color: #3b82f6;
        }
        
        .member-info h3 {
            margin: 0 0 5px 0;
            color: #333;
        }
        
        .age {
            margin: 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .children {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 15px;
            gap: 10px;
        }
        
        @media (max-width: 768px) {
            .family-member {
                min-width: 120px;
                padding: 10px;
            }
            
            .family-member.level-0 {
                min-width: 150px;
            }
        }
    </style>
</head>
<body>
    <div class="family-tree">
        <h1>شجرة العائلة</h1>
        ${generateBladeTemplate(data)}
    </div>
</body>
</html>`;
}

// Function to generate individual Blade component files
function generateBladeComponents(data, outputPath) {
  // Create components directory if it doesn't exist
  const componentsDir = path.join(outputPath, 'components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  // Generate main family tree template
  const mainTemplate = generateMainBladeTemplate(data);
  fs.writeFileSync(path.join(outputPath, 'family-tree.blade.php'), mainTemplate);
  
  // Generate component for individual member
  const memberComponent = `<!-- resources/views/components/family-member.blade.php -->
<div class="family-member level-{{ $level ?? 0 }}" data-id="{{ $member['id'] }}">
    <div class="member-info">
        <h3>{{ $member['name'] }}</h3>
        <p class="age">{{ $member['age'] }}</p>
    </div>
    
    @if (!empty($member['children']))
        <div class="children">
            @foreach ($member['children'] as $child)
                <x-family-member :member="$child" :level="($level ?? 0) + 1" />
            @endforeach
        </div>
    @endif
</div>`;
  
  fs.writeFileSync(path.join(componentsDir, 'family-member.blade.php'), memberComponent);
  
  // Generate controller example
  const controllerExample = `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

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
}`;
  
  fs.writeFileSync(path.join(outputPath, 'FamilyTreeController.php'), controllerExample);
  
  console.log('Blade files exported successfully!');
  console.log('- family-tree.blade.php (main template)');
  console.log('- components/family-member.blade.php (component)');
  console.log('- FamilyTreeController.php (controller example)');
}

// Run the export
const outputPath = path.join(__dirname, 'blade-export');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

generateBladeComponents(familyData, outputPath);
console.log('Blade templates exported to: ' + outputPath);