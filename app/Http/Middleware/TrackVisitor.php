<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Visit;
use Torann\GeoIP\Facades\GeoIP;

class TrackVisitor
{
    public function handle(Request $request, Closure $next)
    {
        Visit::create([
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'country' => GeoIP::getLocation($request->ip())['country'] ?? 'Unknown',
        ]);

        return $next($request);
    }
}
