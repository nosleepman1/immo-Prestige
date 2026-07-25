<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conversation extends Model
{
    /** @use HasFactory<\Database\Factories\ConversationFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'client_id',
        'agency_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function isParticipant(User $user): bool
    {
        if ($this->client_id === $user->id) {
            return true;
        }

        return (int) $this->agency()->value('user_id') === $user->id;
    }
}
