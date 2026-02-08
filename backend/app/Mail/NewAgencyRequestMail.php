<?php

namespace App\Mail;

use App\Models\Agency;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewAgencyRequestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Agency $agency) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Nouvelle demande d\'agence à traiter');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new-agency-request');
    }
}
