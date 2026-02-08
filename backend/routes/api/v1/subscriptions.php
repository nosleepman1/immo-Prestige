<?php

use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('subscriptions')->group(function () {
    // Public pricing.
    Route::get('/plans', [SubscriptionController::class, 'plans']);

    Route::middleware(['auth:sanctum', 'role:agency', 'password.set'])->group(function () {
        Route::get('/me', [SubscriptionController::class, 'current']);
        Route::post('/checkout', [SubscriptionController::class, 'checkout']);
    });
});

// Verification badge (agencies only) — separate from the subscription.
Route::prefix('verification')->middleware(['auth:sanctum', 'role:agency', 'password.set'])->group(function () {
    Route::post('/checkout', [VerificationController::class, 'checkout']);
});
