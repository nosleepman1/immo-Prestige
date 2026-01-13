<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function myComments(){
        return CommentResource::collection(Comment::where('user_id', Auth::user()->id));
    }

    public function postComments(Post $post){
        return CommentResource::collection(Comment::where('post_id', $post->id));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCommentRequest $request)
    {
        /** 
         * @var \App\Models\User $user 
         * */

        
        $user = Auth::user();
        $data = $request->validated();
        $data['user_id'] = $user->id;
        $data['post_id'] = $request->post_id;
        $comment = Comment::create($data);

        return response()->json(
            [
                ['message' => 'Comment created successfully'],
                'data' => $comment
            ], 201);
    }
        

    /**
     * Display the specified resource.
     */
    public function show(Comment $comment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommentRequest $request, Comment $comment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment)
    {
        //
    }
}