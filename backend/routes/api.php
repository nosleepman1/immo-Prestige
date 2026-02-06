<?php

use App\Http\Controllers\AgencyController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::apiResource('posts', PostController::class);


Route::group(['prefix' => 'agency'], function () {
    Route::get('/', [AgencyController::class, 'index']);
    Route::post('/store', [AgencyController::class, 'store']);
    Route::get('/{agency}', [AgencyController::class, 'show'])->middleware('auth:sanctum');
    Route::put('/{agency}', [AgencyController::class, 'update']);
});

Route::group(['prefix' => 'users'], function () {
    Route::get('/', [UserController::class, 'index']);
    Route::get('/{user}', [UserController::class, 'show']);
    Route::post('/register', [UserController::class, 'store']);
    Route::post('/login', [UserController::class, 'login']);
    Route::put('/{user}', [UserController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('auth:sanctum');
    Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');
});

