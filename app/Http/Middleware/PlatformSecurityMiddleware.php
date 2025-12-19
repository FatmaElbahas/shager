<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\RateLimiter;

class PlatformSecurityMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $settings = Setting::first();

        if ($settings) {
            if ($settings->ssl_protection && !$request->secure()) {
                return redirect()->secure($request->getRequestUri());
            }

            if ($settings->ddos_protection) {
                $key = sprintf('rate-limit:%s', $request->ip());
                if (RateLimiter::tooManyAttempts($key, 60)) {
                    return response()->json(['message' => 'تم تجاوز الحد المسموح من الطلبات، حاول لاحقًا.'], 429);
                }
                RateLimiter::hit($key, 60);
            }

            if ($settings->security_provider_integration) {
                // تحقق من مزود الأمان لو مفعّل
            }

            if ($settings->encryption_enabled && $request->has('sensitive_data')) {
                $request->merge([
                    'sensitive_data' => Crypt::encryptString($request->input('sensitive_data'))
                ]);
            }
        }

        $response = $next($request);

        if (isset($settings) && $settings->encryption_enabled && $response->getStatusCode() == 200) {
            $data = $response->getOriginalContent();

            if (is_array($data) && isset($data['sensitive_data'])) {
                $data['sensitive_data'] = Crypt::decryptString($data['sensitive_data']);
                return response()->json($data, 200);
            }
        }

        return $response;
    }
}
