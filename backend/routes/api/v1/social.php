<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\CommentReplyController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('posts')->group(function () {
    // Guest: read published-property posts and their comments. No writes.
    Route::get('/', [PostController::class, 'index']);
    Route::get('/{post}', [PostController::class, 'show']);
    Route::get('/{post}/comments', [CommentController::class, 'index']);

    Route::middleware(['auth:sanctum', 'password.set'])->group(function () {
        Route::post('/', [PostController::class, 'store']);
        Route::delete('/{post}', [PostController::class, 'destroy']);
        Route::post('/{post}/like', [LikeController::class, 'toggle']);
        Route::post('/{post}/comments', [CommentController::class, 'store']);
    });
});

Route::middleware(['auth:sanctum', 'password.set'])->group(function () {
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    Route::post('/comments/{comment}/replies', [CommentReplyController::class, 'store']);
    Route::delete('/comment-replies/{commentReply}', [CommentReplyController::class, 'destroy']);

    Route::post('/reports', [ReportController::class, 'store'])->middleware('throttle:reports');
});
