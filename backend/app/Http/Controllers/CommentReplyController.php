<?php

namespace App\Http\Controllers;

use App\Actions\Post\CreateCommentReply;
use App\Actions\Post\DeleteCommentReply;
use App\Http\Requests\StoreCommentReplyRequest;
use App\Http\Resources\CommentReplyResource;
use App\Models\Comment;
use App\Models\CommentReply;
use Illuminate\Http\JsonResponse;

class CommentReplyController extends Controller
{
    public function store(StoreCommentReplyRequest $request, Comment $comment, CreateCommentReply $createReply): JsonResponse
    {
        $this->authorize('create', CommentReply::class);

        abort_unless(
            $comment->post()->whereHas('property', fn ($q) => $q->published())->exists(),
            404
        );

        $reply = $createReply->handle($comment, $request->user(), $request->validated()['content']);

        return CommentReplyResource::make($reply->load('user'))->response()->setStatusCode(201);
    }

    public function destroy(CommentReply $commentReply, DeleteCommentReply $deleteReply): JsonResponse
    {
        $this->authorize('delete', $commentReply);

        $deleteReply->handle($commentReply);

        return response()->json(null, 204);
    }
}
