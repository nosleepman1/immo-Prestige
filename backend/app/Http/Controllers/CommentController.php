<?php

namespace App\Http\Controllers;

use App\Actions\Post\CreateComment;
use App\Actions\Post\DeleteComment;
use App\Actions\Post\UpdateComment;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CommentController extends Controller
{
    /**
     * Public comments for a post (guest-readable), single level of replies.
     */
    public function index(Post $post): AnonymousResourceCollection
    {
        abort_unless($post->property()->published()->exists(), 404);

        $comments = $post->comments()
            ->with(['user', 'replies.user'])
            ->withCount('replies')
            ->latest()
            ->get();

        return CommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Post $post, CreateComment $createComment): JsonResponse
    {
        $this->authorize('create', Comment::class);

        abort_unless($post->property()->published()->exists(), 404);

        $comment = $createComment->handle($post, $request->user(), $request->validated()['content']);

        return CommentResource::make($comment->load('user'))->response()->setStatusCode(201);
    }

    public function update(UpdateCommentRequest $request, Comment $comment, UpdateComment $updateComment): CommentResource
    {
        $this->authorize('update', $comment);

        return CommentResource::make($updateComment->handle($comment, $request->validated()['content']));
    }

    public function destroy(Comment $comment, DeleteComment $deleteComment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $deleteComment->handle($comment);

        return response()->json(null, 204);
    }
}
