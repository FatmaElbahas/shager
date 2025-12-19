<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TreeTemplate;

class TreeTemplateController extends Controller
{
    public function index()
    {
        $templates = TreeTemplate::with('user')->get();
        return response()->json($templates);
    }
}
