<?php

namespace App\Mail;

use App\Models\Agency;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AgencyAcceptedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Agency $agency, public string $setupUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre agence a été acceptée');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.agency-accepted');
    }
}
