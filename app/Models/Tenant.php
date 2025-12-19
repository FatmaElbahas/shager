<?php

use App\Models\Tenant;

$tenant = Tenant::find($user->tenant_id);
$tenant->domains()->create([
    'domain' => $purchasedDomain // الدومين اللي اليوزر اشتراه
]);

