<?php

namespace App\Http\Controllers;

use App\Models\CommentReply;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentReplyRequest;
use App\Http\Requests\UpdateCommentReplyRequest;

class CommentReplyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // commeent replies listing logic here
        return response()->json(CommentReply::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCommentReplyRequest $request)
    {
        // comment reply creation logic here
        $data = $request->validated();
        $commentReply = CommentReply::create($data);

        return response()->json(
            [
                ['message' => 'Comment reply created successfully'],
                'data' => $commentReply
            ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CommentReply $commentReply)
    {
        return response()->json($commentReply);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommentReplyRequest $request, CommentReply $commentReply)
    {
        // comment reply update logic here
        $data = $request->validated();
        $commentReply->update($data);

        return response()->json(
            [
                ['message' => 'Comment reply updated successfully'],
                'data' => $commentReply
            ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommentReply $commentReply)
    {
        //
    }
}