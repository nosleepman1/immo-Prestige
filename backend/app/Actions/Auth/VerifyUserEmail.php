<?php

namespace App\Actions\Auth;

use App\Exceptions\InvalidVerificationHashException;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class VerifyUserEmail
{
    public function handle(int $id, string $hash): User
    {
        $user = User::findOrFail($id);

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            throw new InvalidVerificationHashException();
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            Mail::to($user->getEmailForVerification())->send(new WelcomeMail($user->name, $user->email));
        }

        return $user;
    }
}
