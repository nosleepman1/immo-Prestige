<?php

use App\Http\Controllers\AgencyController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CommentReplyController;
use App\Http\Controllers\DeviseController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertyImageController;
use App\Http\Controllers\PropertyTypeController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::group(['prefix' => 'users'], function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{user}', [UserController::class, 'show']);
        Route::post('/register', [UserController::class, 'store']);
        Route::post('/login', [UserController::class, 'login']);
        Route::put('/{user}', [UserController::class, 'update'])->middleware(['auth:sanctum', 'verified ']);
        Route::delete('/{user}', [UserController::class, 'destroy'])->middleware(['auth:sanctum', 'verified']);
        Route::post('/logout', [UserController::class, 'logout'])->middleware(['auth:sanctum', 'verified']);
    });

Route::get('/verify/{id}/{hash}', [UserController::class,'verify'])->name('verification.verify');



Route::group(['prefix' => 'agency'], function () {
    Route::get('/', [AgencyController::class, 'index'])->middleware(['auth:sanctum', 'verified']);      
    Route::post('/store', [AgencyController::class, 'store'])->middleware(['auth:sanctum', 'verified']);
    Route::get('/{agency}', [AgencyController::class, 'show'])->middleware(['auth:sanctum', 'verified']);
    Route::put('/{agency}', [AgencyController::class, 'update'])->middleware(['auth:sanctum', 'verified']);
    Route::delete('/{agency}', [AgencyController::class, 'destroy'])->middleware(['auth:sanctum', 'verified']);
});

Route::group(['prefix' => 'properties'], function () {
    Route::get('/', [PropertyController::class, 'index'])->middleware(['auth:sanctum', 'verified']);
    Route::post('/store', [PropertyController::class, 'store'])->middleware(['auth:sanctum', 'verified']);
    Route::get('/{property}', [PropertyController::class, 'show'])->middleware(['auth:sanctum', 'verified']);
    Route::put('/{property}', [PropertyController::class, 'update'])->middleware(['auth:sanctum', 'verified']);
    Route::delete('/{property}', [PropertyController::class, 'destroy'])->middleware(['auth:sanctum', 'verified']);
    Route::group(['prefix'=> 'messages'], function () {
    Route::get('/', [PropertyController::class,'index'])->middleware(['auth:sanctum', 'verified']);
    Route::post('/image/{property}', [PropertyImageController::class,'store'])->middleware(['auth-sanctum','verified']);
    Route::post('/images/{property}', [PropertyImageController::class, 'showPropertyImage'])->middleware(['auth-sanctum', 'verified']);
    });

    Route::get('/conversation/{user}', [PropertyController::class,'MyConversation'])
            ->middleware(['auth:sanctum', 'verified']);
    

    Route::post('/new', [PropertyController::class,'store'])
            ->middleware(['auth:sanctum', 'verified']);
    

    Route::put('/set{message}', [PropertyController::class,'update'])
            ->middleware(['auth:sanctum', 'verified']);
    

    Route::delete('', [PropertyController::class,'destroy'])
            ->middleware(['auth:sanctum', 'verified']);
});




Route::apiResource('posts', PostController::class)
        ->middleware(['auth:sanctum', 'verified']);




Route::group(['prefix' => 'posts'], function () {

    Route::post('/{post}/like', [LikeController::class, 'store'])
            ->middleware(['auth:sanctum', 'verified']);

            
    Route::get('/{post}/likes', [LikeController::class, 'postLikes']);


    Route::delete('/{post}/unlike', [LikeController::class, 'destroy'])
            ->middleware(['auth:sanctum', 'verified']);


    Route::get('/{post}/comments', [CommentController::class, 'postComments']);


    Route::post('/{post}/comment', [CommentController::class, 'store'])
            ->middleware(['auth:sanctum', 'verified']);


    Route::put('/{post}/comment/{comment}', [CommentController::class, 'update'])
            ->middleware(['auth:sanctum', 'verified']);


    Route::delete('/{post}/comment/{comment}', [CommentController::class, 'destroy'])
            ->middleware(['auth:sanctum', 'verified']);  
});




Route::prefix('comments')->group(function () {
    

    Route::get('/my', [CommentController::class, 'myComments'])
            ->middleware(['auth:sanctum', 'verified']);


    Route::get('/{comment}', [CommentController::class, 'show']);


    Route::post('/{comment}/reply', [CommentReplyController::class, 'store'])
            ->middleware(['auth:sanctum', 'verified']);


    Route::put('/reply/{commentReply}', [CommentReplyController::class, 'update'])
            ->middleware(['auth:sanctum', 'verified']);


    Route::delete('/reply/{commentReply}', [CommentReplyController::class, 'destroy'])
            ->middleware(['auth:sanctum', 'verified']);


    Route::get('/reply/{commentReply}', [CommentReplyController::class, 'show']);


    Route::get('/{comment}/replies', [CommentReplyController::class, 'index']);
});




Route::group(['prefix' => 'devises'], function () {
    Route::post('store', [DeviseController::class, 'store'])
            ->middleware(['auth:sanctum', 'verified']);
   
            Route::get('index', [DeviseController::class, 'index'])
            ->middleware(['auth:sanctum', 'verified']);
   
            Route::get('{devise}', [DeviseController::class, 'show'])
            ->middleware(['auth:sanctum', 'verified']); 
    
            Route::put('{devise}', [DeviseController::class, 'update'])
            ->middleware(['auth:sanctum', 'verified']);
   
            Route::delete('{devise}', [DeviseController::class, 'destroy'])
            ->middleware(['auth:sanctum', 'verified']);
});



Route::group(['prefix' => 'propertytypes'], function () {
   
        Route::post('store', [PropertyTypeController::class, 'store'])
            ->middleware(['auth:sanctum', 'verified']);
   
            Route::get('index', [PropertyTypeController::class, 'index'])
            ->middleware(['auth:sanctum', 'verified']);
   
            Route::get('{propertytype}', [PropertyTypeController::class, 'show'])
            ->middleware(['auth:sanctum', 'verified']);
   
            Route::put('{propertytype}', [PropertyTypeController::class, 'update'])
            ->middleware(['auth:sanctum', 'verified']);
   
            Route::delete('{propertytype}', [PropertyTypeController::class, 'destroy'])
            ->middleware(['auth:sanctum', 'verified']);
});
