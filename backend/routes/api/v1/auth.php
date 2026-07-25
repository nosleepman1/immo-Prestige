<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/user', [UserController::class, 'me'])->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('/register', [UserController::class, 'store'])->middleware('throttle:register');
    Route::post('/login', [UserController::class, 'login']);
    Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/verify/{id}/{hash}', [UserController::class, 'verify'])->name('verification.verify');

    Route::put('/{user}', [UserController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('auth:sanctum');
});
