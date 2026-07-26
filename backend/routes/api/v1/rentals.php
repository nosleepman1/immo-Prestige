<?php

use App\Http\Controllers\OwnerController;
use Illuminate\Support\Facades\Route;

// Rental module. Owners are agency-internal: the whole group sits behind the
// agency role, and OwnerPolicy scopes each record to its own agency.
Route::prefix('agency')->middleware(['auth:sanctum', 'role:agency', 'password.set'])->group(function () {
    Route::get('/owners', [OwnerController::class, 'index']);
    Route::post('/owners', [OwnerController::class, 'store']);
    Route::get('/owners/{owner}', [OwnerController::class, 'show']);
    Route::put('/owners/{owner}', [OwnerController::class, 'update']);
    Route::delete('/owners/{owner}', [OwnerController::class, 'destroy']);
});
