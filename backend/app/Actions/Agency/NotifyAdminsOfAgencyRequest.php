<?php

namespace App\Actions\Agency;

use App\Enums\UserRole;
use App\Mail\NewAgencyRequestMail;
use App\Models\Agency;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotifyAdminsOfAgencyRequest
{
    public function handle(Agency $agency): void
    {
        $admins = User::where('role', UserRole::Admin->value)->pluck('email');

        if ($admins->isNotEmpty()) {
            // Queued mailable (ShouldQueue).
            Mail::to($admins->all())->send(new NewAgencyRequestMail($agency));
        }
    }
}
