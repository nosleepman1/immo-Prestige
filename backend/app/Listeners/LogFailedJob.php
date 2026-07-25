<?php

namespace App\Listeners;

use App\Enums\UserRole;
use App\Mail\JobFailedMail;
use App\Models\User;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Every job failure (final attempt exhausted) is logged on the structured
 * 'business' channel and mailed to admins — a failed IPN or resize job
 * should never disappear silently into failed_jobs unnoticed.
 */
class LogFailedJob
{
    public function handle(JobFailed $event): void
    {
        $payload = [
            'connection' => $event->connectionName,
            'queue' => $event->job->getQueue(),
            'job' => $event->job->resolveName(),
            'exception' => $event->exception->getMessage(),
        ];

        Log::channel('business')->error('Job failed permanently', $payload);

        $adminEmails = User::where('role', UserRole::Admin->value)->pluck('email');

        if ($adminEmails->isNotEmpty()) {
            Mail::to($adminEmails->all())->queue(new JobFailedMail($payload));
        }
    }
}
