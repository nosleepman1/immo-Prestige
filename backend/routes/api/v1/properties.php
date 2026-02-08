<?php

use App\Http\Controllers\DeviseController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertyImageController;
use App\Http\Controllers\PropertyTypeController;
use Illuminate\Support\Facades\Route;

// Public reference data needed to populate the property creation form
// (property_type_id / devise_id are required, exists-validated foreign keys).
Route::get('/property-types', [PropertyTypeController::class, 'index']);
Route::get('/devises', [DeviseController::class, 'index']);

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
