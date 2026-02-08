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
     * Idempotent under concurrency: the reviewed-state guard runs inside the
     * transaction against a row-locked reload, so a double-click cannot issue
     * two tokens or two e-mails.
     */
    public function handle(Agency $agency, User $admin): Agency
    {
        $email = $agency->user()->value('email');

        [$agency, $setupUrl] = DB::transaction(function () use ($agency, $admin, $email) {
            $locked = Agency::whereKey($agency->getKey())->lockForUpdate()->first();

            if ($locked->isReviewed()) {
                throw new AgencyAlreadyReviewedException();
            }

            $locked->update([
                'status' => AgencyStatus::Accepted,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            $plaintext = Str::random(64);
            PasswordSetupToken::create([
                'user_id' => $locked->user_id,
                'token' => hash('sha256', $plaintext),
                'expires_at' => now()->addDay(),
            ]);

            $setupUrl = rtrim(config('app.frontend_url'), '/')
                .'/agency/password?token='.$plaintext
                .'&email='.urlencode($email);

            return [$locked, $setupUrl];
        });

        Mail::to($email)->send(new AgencyAcceptedMail($agency, $setupUrl));

        return $agency;
    }
}
