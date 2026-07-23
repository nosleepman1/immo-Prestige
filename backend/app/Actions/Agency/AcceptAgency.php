<?php

namespace App\Actions\Agency;

use App\Enums\AgencyStatus;
use App\Exceptions\AgencyAlreadyReviewedException;
use App\Mail\AgencyAcceptedMail;
use App\Models\Agency;
use App\Models\PasswordSetupToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AcceptAgency
{
    /**
     * Idempotent: a second review is refused so no duplicate token/e-mail is issued.
     */
    public function handle(Agency $agency, User $admin): Agency
    {
        if ($agency->isReviewed()) {
            throw new AgencyAlreadyReviewedException();
        }

        $email = $agency->user()->value('email');

        [$agency, $setupUrl] = DB::transaction(function () use ($agency, $admin, $email) {
            $agency->update([
                'status' => AgencyStatus::Accepted,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            $plaintext = Str::random(64);
            PasswordSetupToken::create([
                'user_id' => $agency->user_id,
                'token' => hash('sha256', $plaintext),
                'expires_at' => now()->addDay(),
            ]);

            $setupUrl = rtrim(config('app.frontend_url'), '/')
                .'/agency/password?token='.$plaintext
                .'&email='.urlencode($email);

            return [$agency, $setupUrl];
        });

        Mail::to($email)->send(new AgencyAcceptedMail($agency, $setupUrl));

        return $agency;
    }
}
