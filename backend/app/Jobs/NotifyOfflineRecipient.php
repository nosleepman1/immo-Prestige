<?php

namespace App\Jobs;

use App\Mail\UnreadMessagesMail;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

/**
 * Delayed and batched: dispatched once per (conversation, recipient) per
 * 5-minute window (see SendMessage), then reports however many messages are
 * still unread at fire time — one mail for a burst, not one per message.
 */
class NotifyOfflineRecipient implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [30, 60, 120];

    public function __construct(public int $conversationId, public int $recipientId)
    {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        $conversation = Conversation::find($this->conversationId);
        $recipient = User::find($this->recipientId);

        if (! $conversation || ! $recipient) {
            return;
        }

        $unreadCount = $conversation->messages()
            ->where('sender_id', '!=', $this->recipientId)
            ->whereNull('read_at')
            ->count();

        if ($unreadCount === 0) {
            return;
        }

        Mail::to($recipient->email)->send(new UnreadMessagesMail($conversation, $unreadCount));
    }
}
