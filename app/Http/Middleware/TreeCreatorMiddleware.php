<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TreeCreatorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'tree_creator') {
            return response()->json(['message' => 'Access Denied. Tree Creators Only.'], 403);
        }
        return $next($request);
    }
}
