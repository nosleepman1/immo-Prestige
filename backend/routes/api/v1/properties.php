<?php

use App\Http\Controllers\PropertyController;
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
    });

    // Public show (published); owner/admin may also view own drafts.
    Route::get('/{property}', [PropertyController::class, 'show']);
});
