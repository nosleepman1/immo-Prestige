<?php

use App\Http\Controllers\ConversationController;
use Illuminate\Support\Facades\Route;

Route::prefix('conversations')->middleware(['auth:sanctum', 'password.set'])->group(function () {
    Route::get('/', [ConversationController::class, 'index']);
    Route::post('/', [ConversationController::class, 'store']);
    Route::get('/{conversation}/messages', [ConversationController::class, 'messages']);
    Route::post('/{conversation}/messages', [ConversationController::class, 'sendMessage'])
        ->middleware('throttle:messages');
    Route::post('/{conversation}/read', [ConversationController::class, 'markRead']);
});
