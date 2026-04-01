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

    public function store(Post $post)
    {
        $userId = Auth::user()->id;
        
        $existingLike = Like::where('user_id', $userId)
            ->where('post_id', $post->id)
            ->first();

        if ($existingLike) {
            $existingLike->delete();
            return response()->json([
                'liked' => false,
                'message' => 'Post unliked'
            ], 200);
        }

        $like = Like::create([
            'user_id' => $userId,
            'post_id' => $post->id
        ]);

        return response()->json([
            'liked' => true,
            'message' => 'Post liked',
            'data' => new LikeResource($like)
        ], 201);
    }

    
}