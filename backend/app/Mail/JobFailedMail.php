<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class JobFailedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param  array<string, string>  $details
     */
    public function __construct(public array $details) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Échec de job : '.$this->details['job']);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.job-failed');
    }
}
