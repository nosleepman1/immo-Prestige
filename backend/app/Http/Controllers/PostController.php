<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Agency;
use App\Models\Property;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PostResource::collection(Post::all());
    }


    public function agencyPosts(Agency $agency)
    {
        if(Auth::user()->id == $agency->user_id){
            return PostResource::collection(Post::where('agency_id', $agency->id)->get());
        }  
    }

    
    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request)
    {
        if(Auth::user()->role !== 'agency'){
             return response()->json(
                [
                    'error' => 'Vous n\'avez pas le droit de poster'
                ],
                403
             );
        }

        $data = $request->validated();

        $data['user_id'] = Auth::user()->id;

        $property = Property::find($data['property_id']);

        if($property->is_posted){
            return response()->json([
                'message' => 'This property is already posted'
            ], 400);
        }
        
        $res = $property->update([
            'is_posted' => true
        ]);

        if($res){
            $post = Post::create($data);
            return new PostResource($post);
        }

        return response()->json([
            'message' => 'Failed to update agency.'
        ], 500);
       
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return new PostResource($post);
    }


    public function update(UpdatePostRequest $request, Post $post)
    {
        if(Auth::user()->id !== $post->user_id){
            return response()->json([
                'error' => 'Vous n\'avez pas le droit de modifier ce post'
            ], 403);
        }

        $data = $request->validated();
        $post->update($data);
        return new PostResource($post);
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $post->delete();
        return response()->json([
            'message' => 'Post deleted successfully.'
        ], 200);
    }
}