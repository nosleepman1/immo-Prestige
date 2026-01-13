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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCommentReplyRequest $request)
    {
        
    }

    /**
     * Display the specified resource.
     */
    public function show(CommentReply $commentReply)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommentReplyRequest $request, CommentReply $commentReply)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommentReply $commentReply)
    {
        //
    }
}