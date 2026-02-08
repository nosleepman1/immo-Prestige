<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PostFactory> */
    use HasFactory;
    //use SoftDeletes;

    protected $fillable = [
        'user_id',
        'property_id'
    ];

   
    public function likes() 
    {
        return $this->hasMany(Like::class);
    }

    public function comment()
    {
        return $this->hasMany(Comment::class);
    }

    public function property() {
        return $this->belongsTo(Property::class);
    
    }
}