<?php

use App\Http\Controllers\AdminAgencyController;
use App\Http\Controllers\AdminReportController;
use Illuminate\Support\Facades\Route;

// Admin escapes agency scoping but not the policies. auth first so guests get 401.
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/agencies', [AdminAgencyController::class, 'index']);
    Route::get('/agencies/{agency}', [AdminAgencyController::class, 'show']);
    Route::post('/agencies/{agency}/accept', [AdminAgencyController::class, 'accept']);
    Route::post('/agencies/{agency}/refuse', [AdminAgencyController::class, 'refuse']);

    Route::get('/reports', [AdminReportController::class, 'index']);
    Route::patch('/reports/{report}/review', [AdminReportController::class, 'review']);
});
