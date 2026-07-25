<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Public channel: the payload is an aggregate count only, never who liked —
 * no user data ever travels on a public channel.
 */
class PostLikesUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $postId, public int $likesCount) {}

    /**
     * @return array<Channel>
     */
    public function broadcastOn(): array
    {
        return [new Channel('posts.'.$this->postId)];
    }

    public function broadcastAs(): string
    {
        return 'post.likes.updated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return ['likes_count' => $this->likesCount];
    }

    public function broadcastQueue(): string
    {
        return 'default';
    }
}
