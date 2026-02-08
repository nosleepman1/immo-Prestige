<?php

namespace App\Mail;

use App\Models\Conversation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UnreadMessagesMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Conversation $conversation, public int $unreadCount) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Vous avez '.$this->unreadCount.' nouveau(x) message(s)');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.unread-messages');
    }
}
