<?php

namespace App\Http\Controllers;

use App\Models\CommentReply;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentReplyRequest;
use App\Http\Requests\UpdateCommentReplyRequest;
use App\Http\Resources\CommentReplyResource;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class CommentReplyController extends Controller
{
    public function index(Post $post)
    {
        $commentReplies = CommentReply::where('post_id', $post->id)
            ->with(['user:id,name'])
            ->get();
    }

    public function store(StoreCommentReplyRequest $request, Comment $comment)
    {

        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $data['comment_id'] = $comment->id;
        $commentReply = CommentReply::create($data);

        return response()->json(
            [
                'message' => 'Comment reply created successfully',
                'data' => new CommentReplyResource($commentReply)
            ], 201);
    }

    public function show(CommentReply $commentReply)
    {
        return new CommentReplyResource($commentReply);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommentReplyRequest $request, CommentReply $commentReply)
    {
        // comment reply update logic here
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;

        $commentReply->update($data);

        return response()->json(
            [
                ['message' => 'Comment reply updated successfully'],
                'data' => new CommentReplyResource($commentReply)
            ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommentReply $commentReply)
    {
        $commentReply->delete();

        return response()->json(
            [
                ['message' => 'Comment reply deleted successfully']
            ], 200);
    }
}
