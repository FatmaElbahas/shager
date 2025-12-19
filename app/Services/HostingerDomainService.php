<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HostingerDomainService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.hostinger.com/v1';

    public function __construct()
    {
        $this->apiKey = env('HOSTINGER_API_KEY');
    }

    /**
     * التحقق من توفر الدومين
     * Note: Hostinger API قد لا يدعم التحقق المباشر من التوفر
     * لذلك نستخدم DNS lookup كطريقة بديلة
     */
    public function checkDomainAvailability($domain)
    {
        try {
            // محاولة استخدام Hostinger API إذا كان متوفر
            // Note: قد تحتاج إلى تعديل endpoint حسب وثائق Hostinger API الفعلية
            if ($this->apiKey) {
                // محاولة endpoint محتمل (يجب التحقق من الوثائق الفعلية)
                $endpoint = $this->baseUrl . "/domains/check";
                
                $response = Http::withToken($this->apiKey)
                    ->timeout(5)
                    ->post($endpoint, [
                        'domain' => $domain
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return [
                        'available' => $data['available'] ?? false,
                        'domain' => $domain,
                        'price' => $data['price'] ?? null,
                        'currency' => $data['currency'] ?? 'USD'
                    ];
                }
            }

            // إذا فشل API، نستخدم DNS lookup
            return $this->checkViaDNS($domain);
        } catch (\Exception $e) {
            Log::error('Hostinger domain availability check failed: ' . $e->getMessage());
            // Fallback to DNS lookup
            return $this->checkViaDNS($domain);
        }
    }

    /**
     * التحقق من توفر الدومين عبر DNS lookup
     */
    private function checkViaDNS($domain)
    {
        $dnsRecords = @dns_get_record($domain, DNS_ANY);
        $available = empty($dnsRecords) || !isset($dnsRecords[0]);
        
        return [
            'available' => $available,
            'domain' => $domain,
            'price' => null,
            'currency' => 'SAR',
            'method' => 'dns'
        ];
    }

    /**
     * الحصول على سعر الدومين
     * Note: قد تحتاج إلى تعديل endpoint حسب وثائق Hostinger API الفعلية
     */
    public function getDomainPrice($domain)
    {
        try {
            if (!$this->apiKey) {
                return null;
            }

            // محاولة endpoint محتمل (يجب التحقق من الوثائق الفعلية)
            $endpoint = $this->baseUrl . "/domains/pricing";
            
            $response = Http::withToken($this->apiKey)
                ->timeout(5)
                ->get($endpoint, [
                    'domain' => $domain
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['price'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Hostinger domain price check failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * إنشاء A Record بعد شراء الدومين
     */
    public function createARecord($domain, $serverIp)
    {
        $endpoint = $this->baseUrl . "/dns-zones/{$domain}/records";

        $response = Http::withToken($this->apiKey)
            ->post($endpoint, [
                'type' => 'A',
                'name' => '@',
                'value' => $serverIp,
                'ttl' => 300
            ]);

        return $response->json();
    }

    /**
     * شراء الدومين
     */
    public function purchaseDomain($domain, $years = 1)
    {
        try {
            $endpoint = $this->baseUrl . "/domains/purchase";
            
            $response = Http::withToken($this->apiKey)
                ->post($endpoint, [
                    'domain' => $domain,
                    'years' => $years
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Hostinger domain purchase failed: ' . $e->getMessage());
            return null;
        }
    }
}
