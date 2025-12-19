<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminAssistant
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'admin_assistant') {
            return response()->json(['message' => 'Access Denied. Admins Only.'], 403);
        }

        return $next($request);
    }
}
