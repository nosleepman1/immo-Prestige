<?php

use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('subscriptions')->group(function () {
    // Public pricing.
    Route::get('/plans', [SubscriptionController::class, 'plans']);

    Route::middleware(['auth:sanctum', 'role:agency', 'password.set'])->group(function () {
        Route::get('/me', [SubscriptionController::class, 'current']);
        Route::post('/checkout', [SubscriptionController::class, 'checkout']);
    });
});
