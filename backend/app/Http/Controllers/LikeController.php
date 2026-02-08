<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLikeRequest;
use App\Http\Requests\UpdateLikeRequest;
use App\Http\Resources\LikeResource;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class LikeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // retur count of likes for a specific post or post
        return response()->json(Like::all());
    }

    public function postLikes( Post $post)
    {
        $likes = Like::where('post_id', $post->id)
            ->with(['user:id,name'])
            ->get();
        
        
        if($likes->isEmpty()){
            return response()->json(
                [
                    'message' => 'No likes found for this post'
                ], 404);
        }

        $nomberLikes = $likes->count();
        return response()->json([
            'likes_count' => $nomberLikes,
            'likes' => LikeResource::collection($likes)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(StoreLikeRequest $request, Post $post)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $data['post_id'] = $post->id;
        $like = Like::create($data);

        return new LikeResource($like);
    }

    /**
     * Display the specified resource.
     */
    public function show(Like $like)
    {

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Like $like)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Like $like)
    {
        // like deletion logic here
        $like->delete();
        return response()->json(
            [
                ['message' => 'Like deleted successfully']
            ], 200);
    }
}