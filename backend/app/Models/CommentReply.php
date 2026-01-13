<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommentReply extends Model
{
    /** @use HasFactory<\Database\Factories\CommentReplyFactory> */
    use HasFactory;

    protected $fillable = [
        'comment_id',
        'user_id',
        'content'
    ];


    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }

    
}