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
use App\Http\Resources\AgencyResource;
use App\Http\Resources\UserResource;
use App\Models\Agency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    $agency = Agency::where('user_id', $request->user()->id)->first();

    return response()->json([
        'user' => new UserResource($request->user()),
        'agency' => $agency ? new AgencyResource($agency) : null,
    ], 200);
})->middleware('auth:sanctum');


Route::group(['prefix' => 'auth'], function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/user', [UserController::class, 'show'])->middleware(['auth:sanctum']);
        Route::post('/register', [UserController::class, 'store']);
        Route::post('/login', [UserController::class, 'login']);
        Route::put('/{user}', [UserController::class, 'update'])->middleware(['auth:sanctum']);
        Route::delete('/{user}', [UserController::class, 'destroy'])->middleware(['auth:sanctum']);
        Route::post('/logout', [UserController::class, 'logout'])->middleware(['auth:sanctum']);
    });

Route::get('/verify/{id}/{hash}', [UserController::class,'verify'])->name('verification.verify');



Route::group(['prefix' => 'agency'], function () {
    Route::get('/', [AgencyController::class, 'index'])->middleware(['auth:sanctum']);
    Route::post('/store', [AgencyController::class, 'store']);
    Route::get('/{agency}', [AgencyController::class, 'show'])->middleware(['auth:sanctum']);
    Route::put('/{agency}', [AgencyController::class, 'update'])->middleware(['auth:sanctum']);
    Route::delete('/{agency}', [AgencyController::class, 'destroy'])->middleware(['auth:sanctum']);
});




Route::apiResource('properties', PropertyController::class)->middleware(['auth:sanctum']);

Route::prefix('properties')->group(function () {
    Route::get('/{property}/images', [PropertyImageController::class, 'showPropertyImages']);
    Route::post('/{property}/images', [PropertyImageController::class, 'store']);
});




Route::group(['prefix'=> 'posts'], function () {

    Route::post('/new', [PostController::class,'store'])->middleware(['auth:sanctum']);
    Route::get('/', [PostController::class,'index']);
    Route::get('/{post}', [PostController::class,'show']);
    Route::put('/{post}', [PostController::class,'update'])->middleware(['auth:sanctum']);
    Route::delete('/{post}', [PostController::class,'destroy'])->middleware(['auth:sanctum']);
    
});





   Route::group(['prefix','messages'], function() {
         Route::get('/conversation/{user}', [PropertyController::class,'MyConversation'])
            ->middleware(['auth:sanctum']);


        Route::post('/new', [PropertyController::class,'store'])
                ->middleware(['auth:sanctum']);


        Route::put('/set{message}', [PropertyController::class,'update'])
                ->middleware(['auth:sanctum']);


        Route::delete('', [PropertyController::class,'destroy'])
                ->middleware(['auth:sanctum']);
   });










Route::group(['prefix' => 'posts'], function () {

    Route::post('/{post}/like', [LikeController::class, 'store'])
            ->middleware(['auth:sanctum']);


    Route::get('/{post}/likes', [LikeController::class, 'postLikes']);


    Route::delete('/{post}/unlike', [LikeController::class, 'destroy'])
            ->middleware(['auth:sanctum']);


    Route::get('/{post}/comments', [CommentController::class, 'postComments']);


    Route::post('/{post}/comment', [CommentController::class, 'store'])
            ->middleware(['auth:sanctum']);


    Route::put('/{post}/comment/{comment}', [CommentController::class, 'update'])
            ->middleware(['auth:sanctum']);


    Route::delete('/{post}/comment/{comment}', [CommentController::class, 'destroy'])
            ->middleware(['auth:sanctum']);
});




Route::prefix('comments')->group(function () {


    Route::get('/my', [CommentController::class, 'myComments'])
            ->middleware(['auth:sanctum']);


    Route::get('/{comment}', [CommentController::class, 'show']);


    Route::post('/{comment}/reply', [CommentReplyController::class, 'store'])
            ->middleware(['auth:sanctum']);


    Route::put('/reply/{commentReply}', [CommentReplyController::class, 'update'])
            ->middleware(['auth:sanctum']);


    Route::delete('/reply/{commentReply}', [CommentReplyController::class, 'destroy'])
            ->middleware(['auth:sanctum']);


    Route::get('/reply/{commentReply}', [CommentReplyController::class, 'show']);


    Route::get('/{comment}/replies', [CommentReplyController::class, 'index']);
});





Route::apiResource('devises', DeviseController::class);

Route::apiResource('property-types', PropertyTypeController::class);


