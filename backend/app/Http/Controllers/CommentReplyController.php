<?php

namespace App\Http\Controllers;

use App\Models\CommentReply;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentReplyRequest;
use App\Http\Requests\UpdateCommentReplyRequest;
use App\Http\Resources\CommentReplyResource;
use Dom\Comment;
use Illuminate\Support\Facades\Auth;

class CommentReplyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $commentReplies = CommentReply::all();
        if($commentReplies->isEmpty()){
            return response()->json(
                [
                    'message' => 'No comment replies found'
                ], 404);
        }
        return CommentReplyResource::collection($commentReplies);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCommentReplyRequest $request)
    {
       
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $commentReply = CommentReply::create($data);

        return response()->json(
            [
                ['message' => 'Comment reply created successfully'],
                'data' => new CommentReplyResource($commentReply)
            ], 201);
    }

    /**
     * Display the specified resource.
     */
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