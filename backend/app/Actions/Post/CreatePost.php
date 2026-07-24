<?php

namespace App\Actions\Post;

use App\Exceptions\PropertyAlreadyPostedException;
use App\Exceptions\PropertyNotPublishedException;
use App\Models\Post;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\QueryException;

class CreatePost
{
    public function handle(User $user, Property $property): Post
    {
        if (! $property->isPublished()) {
            throw new PropertyNotPublishedException();
        }

        if (Post::where('property_id', $property->id)->exists()) {
            throw new PropertyAlreadyPostedException();
        }

        try {
            return Post::create([
                'user_id' => $user->id,
                'property_id' => $property->id,
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() !== '23000') {
                throw $e;
            }
            // Unique constraint backstop against a concurrent double-post.
            throw new PropertyAlreadyPostedException();
        }
    }
}
