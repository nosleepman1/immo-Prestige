<?php

use App\Http\Controllers\PropertyController;
use Illuminate\Support\Facades\Route;

// Public listing / show and creation are rebuilt in Lot 6a / 6b.
Route::prefix('properties')->middleware('auth:sanctum')->group(function () {
    Route::put('/{property}', [PropertyController::class, 'update']);
    Route::delete('/{property}', [PropertyController::class, 'destroy']);
});
