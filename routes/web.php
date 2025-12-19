<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Family tree page - Blade version (MUST be before catch-all route)
Route::get('/front/shagertk.html', function () {
    // Tree data will be loaded via JavaScript from API
    // This allows the page to work even if not authenticated
    $treeData = null;
    
    // Check if view exists
    if (!view()->exists('front.shagertk')) {
        abort(404, 'View not found');
    }
    
    return view('front.shagertk', compact('treeData'));
})->name('family-tree');

// Domain page - Blade version
Route::get('/front/domain.html', function () {
    // Check if view exists
    if (!view()->exists('front.domain')) {
        abort(404, 'View not found');
    }
    
    return view('front.domain');
})->name('domain');

// Serve the React app for all routes except API routes
Route::get('/{any?}', function () {
    return file_exists(public_path('react/index.html')) 
        ? file_get_contents(public_path('react/index.html'))
        : view('welcome');
})->where('any', '.*');

// API routes should be defined in api.php and will be prefixed with /api automatically