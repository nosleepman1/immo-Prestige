<?php

namespace Tests\Feature\Observability;

use App\Mail\JobFailedMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class FailedJobAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_permanently_failed_job_mails_every_admin(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        User::factory()->create(); // non-admin, must not receive the alert

        $job = new class
        {
            public function getQueue(): string
            {
                return 'media';
            }

            public function resolveName(): string
            {
                return 'App\\Jobs\\ResizePropertyImage';
            }
        };

        event(new JobFailed('redis', $job, new \RuntimeException('boom')));

        Mail::assertQueued(JobFailedMail::class, function (JobFailedMail $mail) use ($admin) {
            return $mail->hasTo($admin->email) && $mail->details['queue'] === 'media';
        });
    }

    public function test_no_admin_means_no_mail_attempt(): void
    {
        Mail::fake();
        User::factory()->create(); // no admin at all

        $job = new class
        {
            public function getQueue(): string
            {
                return 'default';
            }

            public function resolveName(): string
            {
                return 'SomeJob';
            }
        };

        event(new JobFailed('redis', $job, new \RuntimeException('boom')));

        Mail::assertNothingQueued();
    }
}
