<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/user', [UserController::class, 'me'])->middleware('auth:sanctum');

// GDPR export of the authenticated user's own data.
Route::get('/account/export', [AccountController::class, 'export'])->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('/register', [UserController::class, 'store'])->middleware('throttle:register');
    Route::post('/login', [UserController::class, 'login'])->middleware('throttle:login');
    Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/verify/{id}/{hash}', [UserController::class, 'verify'])->name('verification.verify');

    Route::put('/{user}', [UserController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('auth:sanctum');
});
