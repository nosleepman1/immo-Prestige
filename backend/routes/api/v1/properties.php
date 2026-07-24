<?php

use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertyImageController;
use Illuminate\Support\Facades\Route;

Route::prefix('properties')->group(function () {
    // Public listing of published properties.
    Route::get('/', [PropertyController::class, 'index']);

    // Agency-only: create a draft and list own properties.
    Route::middleware(['auth:sanctum', 'role:agency', 'password.set'])->group(function () {
        Route::get('/mine', [PropertyController::class, 'mine']);
        Route::post('/', [PropertyController::class, 'store']);
    });

    // Owner or admin management (policy authorizes; password required for agency owners).
    Route::middleware(['auth:sanctum', 'password.set'])->group(function () {
        Route::put('/{property}', [PropertyController::class, 'update']);
        Route::delete('/{property}', [PropertyController::class, 'destroy']);

        Route::post('/{property}/images', [PropertyImageController::class, 'store']);
        Route::put('/{property}/images/order', [PropertyImageController::class, 'reorder']);
    });

    // Publication additionally requires an active subscription.
    Route::post('/{property}/publish', [PropertyController::class, 'publish'])
        ->middleware(['auth:sanctum', 'password.set', 'subscription.active']);

    // Public show (published); owner/admin may also view own drafts.
    Route::get('/{property}', [PropertyController::class, 'show']);
});

Route::prefix('property-images')->middleware(['auth:sanctum', 'password.set'])->group(function () {
    Route::put('/{propertyImage}/cover', [PropertyImageController::class, 'setCover']);
    Route::delete('/{propertyImage}', [PropertyImageController::class, 'destroy']);
});
