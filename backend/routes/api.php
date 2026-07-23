<?php

use Illuminate\Support\Facades\Route;

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
