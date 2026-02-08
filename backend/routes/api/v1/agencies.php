<?php

use App\Http\Controllers\AgencyController;
use Illuminate\Support\Facades\Route;

Route::prefix('agency')->group(function () {
    // Public onboarding.
    Route::post('/register', [AgencyController::class, 'register'])->middleware('throttle:register');
    Route::post('/password', [AgencyController::class, 'setPassword']);

    // Own account (accessible even before the password is set).
    Route::middleware(['auth:sanctum', 'role:agency'])->group(function () {
        Route::get('/me', [AgencyController::class, 'me']);
        Route::get('/stats', [AgencyController::class, 'stats']);
        Route::post('/resubmit', [AgencyController::class, 'resubmit']);
    });

    // Management (owner/admin) — requires a set password.
    Route::middleware(['auth:sanctum', 'password.set'])->group(function () {
        Route::put('/{agency}', [AgencyController::class, 'update']);
        Route::delete('/{agency}', [AgencyController::class, 'destroy']);
    });
});
