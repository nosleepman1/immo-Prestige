<?php

namespace App\Actions\Messaging;

use App\Events\MessageSent;
use App\Jobs\NotifyOfflineRecipient;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SendMessage
{
    public function handle(Conversation $conversation, User $sender, string $content): Message
    {
        $message = DB::transaction(function () use ($conversation, $sender, $content) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $sender->id,
                'content' => $content,
            ]);

            $conversation->update(['last_message_at' => $message->created_at]);

            return $message;
        });

        // After commit: broadcast is real-time delivery, the notification job
        // is the offline fallback — both are side effects, not the write itself.
        broadcast(new MessageSent($message))->toOthers();

        $this->scheduleOfflineNotification($conversation, $sender);

        return $message;
    }

    private function scheduleOfflineNotification(Conversation $conversation, User $sender): void
    {
        $recipientId = $sender->id === $conversation->client_id
            ? $conversation->agency()->value('user_id')
            : $conversation->client_id;

        if (! $recipientId) {
            return;
        }

        $lockKey = "pending_msg_notification:{$conversation->id}:{$recipientId}";

        // Cache::add is atomic: only the first message in the window schedules
        // the job, so a burst of messages produces one grouped e-mail, not one
        // per message.
        if (Cache::add($lockKey, true, now()->addMinutes(5))) {
            NotifyOfflineRecipient::dispatch($conversation->id, $recipientId)->delay(now()->addMinutes(5));
        }
    }
}
