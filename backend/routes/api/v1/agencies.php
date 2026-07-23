<?php

use App\Http\Controllers\AgencyController;
use Illuminate\Support\Facades\Route;

// Agency onboarding (index / show / create) is rebuilt in Lot 3.
Route::prefix('agency')->middleware('auth:sanctum')->group(function () {
    Route::put('/{agency}', [AgencyController::class, 'update']);
    Route::delete('/{agency}', [AgencyController::class, 'destroy']);
});
