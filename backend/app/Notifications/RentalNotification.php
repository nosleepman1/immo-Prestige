<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Base for every rental notification.
 *
 * All of them go to `database` (so the recipient finds out what happened while
 * they were away) and `broadcast` (so an open screen updates without a reload).
 * Mail is deliberately not universal: it is reserved for events that either
 * expect an action from someone who is not in the app, or that engage money.
 * A subclass opts in by returning true from `sendsMail()`.
 *
 * Queued so a slow SMTP server never delays the HTTP response that triggered it.
 */
abstract class RentalNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The payload shared by the stored notification and the broadcast one —
     * written once so the badge, the list and the live event never disagree.
     *
     * @return array<string, mixed>
     */
    abstract protected function payload(): array;

    /**
     * Short machine-readable label, used by the clients to pick an icon and a
     * destination route without parsing the class name.
     */
    abstract protected function key(): string;

    abstract protected function title(): string;

    protected function sendsMail(): bool
    {
        return false;
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        if ($this->sendsMail()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'key' => $this->key(),
            'title' => $this->title(),
            ...$this->payload(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    /**
     * Subclasses that send mail override this. Kept here so the base class
     * stays valid when the mail channel is inactive.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject($this->title());
    }

    public function broadcastType(): string
    {
        return $this->key();
    }
}
