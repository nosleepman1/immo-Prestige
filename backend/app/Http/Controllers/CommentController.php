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
        $comments = Comment::where('post_id', $post->id)->get();

        if($comments->isEmpty()){
            return response()->json(
                [
                    'message' => 'No comments found for this post'
                ], 404);
        }
        return CommentResource::collection($comments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCommentRequest $request)
    {
  
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $comment = Comment::create($data);

        return new CommentResource($comment);
    }
        

    /**
     * Display the specified resource.
     */
    public function show(Comment $comment)
    {
        return new CommentResource($comment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommentRequest $request, Comment $comment)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;

        $comment->update($data);

        return response()->json(
            [
                ['message' => 'Comment updated successfully'],
                'data' => $comment
            ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment)
    {

       if($comment->user_id !== Auth::user()->id){
            return response()->json(
                [
                    'message' => 'Unauthorized'
                ], 403);
        }

        $comment->delete();
        return response()->json(
            [
                ['message' => 'Comment deleted successfully']
            ], 200);
    }
}