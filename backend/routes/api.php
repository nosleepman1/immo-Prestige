<?php

use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

// Unversioned: infra probes (load balancer, uptime monitor) target this
// directly. Checks the dependencies the API needs, not just that PHP booted
// (that's what Laravel's own /up already covers).
Route::get('/health', [HealthController::class, 'check']);

Route::prefix('v1')->group(function () {
    require __DIR__.'/api/v1/auth.php';
    require __DIR__.'/api/v1/agencies.php';
    require __DIR__.'/api/v1/properties.php';
    require __DIR__.'/api/v1/subscriptions.php';
    require __DIR__.'/api/v1/social.php';
    require __DIR__.'/api/v1/messaging.php';
    require __DIR__.'/api/v1/admin.php';
    require __DIR__.'/api/v1/webhooks.php';
});
