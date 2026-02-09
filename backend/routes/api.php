<?php

use App\Http\Controllers\AgencyController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CommentReplyController;
use App\Http\Controllers\DeviseController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertyTypeController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');





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




Route::group(['prefix' => 'properties'], function () {
    Route::get('/', [PropertyController::class, 'index']);
    Route::post('/store', [PropertyController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/{property}', [PropertyController::class, 'show'])->middleware('auth:sanctum');
    Route::put('/{property}', [PropertyController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{property}', [PropertyController::class, 'destroy'])->middleware('auth:sanctum');
});




Route::group(['prefix'=> 'messages'], function () {
    Route::get('/', [PropertyController::class,'index'])->middleware('auth-sanctum');
    Route::get('/conversation/{user}', [PropertyController::class,'MyConversation'])->middleware('auth-sanctum');
    Route::post('/new', [PropertyController::class,'store'])->middleware('auth-sanctum');
    Route::put('/set{message}', [PropertyController::class,'update'])->middleware('auth-sanctum');
    Route::delete('', [PropertyController::class,'destroy'])->middleware('');
});




Route::apiResource('posts', PostController::class)->middleware('auth:sanctum');




Route::group(['prefix' => 'posts'], function () {

    Route::post('/{post}/like', [LikeController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/{post}/likes', [LikeController::class, 'postLikes']);
    Route::delete('/{post}/unlike', [LikeController::class, 'destroy'])->middleware('auth:sanctum');


    Route::get('/{post}/comments', [CommentController::class, 'postComments']);
    Route::post('/{post}/comment', [CommentController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{post}/comment/{comment}', [CommentController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{post}/comment/{comment}', [CommentController::class, 'destroy'])->middleware('auth:sanctum');
     
});




Route::prefix('comments')->group(function () {
    Route::get('/my', [CommentController::class, 'myComments'])->middleware('auth:sanctum');
    Route::get('/{comment}', [CommentController::class, 'show']);
    Route::post('/{comment}/reply', [CommentReplyController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/reply/{commentReply}', [CommentReplyController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/reply/{commentReply}', [CommentReplyController::class, 'destroy'])->middleware('auth:sanctum');
    Route::get('/reply/{commentReply}', [CommentReplyController::class, 'show']);
    Route::get('/{comment}/replies', [CommentReplyController::class, 'index']);
});




Route::post('devise/new', [DeviseController::class, 'store']);
Route::get('devises', [DeviseController::class, 'index']);
Route::post('propertytype/new', [PropertyTypeController::class, 'store']);
Route::get('propertytype', [PropertyTypeController::class, 'index']);


Route::post('like/new', [LikeController::class, 'store']);