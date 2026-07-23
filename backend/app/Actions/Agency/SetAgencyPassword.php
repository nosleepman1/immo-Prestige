<?php

namespace App\Actions\Agency;

use App\Enums\UserRole;
use App\Events\AgencyActivated;
use App\Exceptions\InvalidPasswordSetupTokenException;
use App\Exceptions\PasswordSetupTokenExpiredException;
use App\Exceptions\PasswordSetupTokenUsedException;
use App\Models\PasswordSetupToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SetAgencyPassword
{
    /**
     * @return array{user: User, agency: \App\Models\Agency, token: string}
     */
    public function handle(string $email, string $plaintextToken, string $password): array
    {
        $user = User::where('email', strtolower($email))
            ->where('role', UserRole::Agency->value)
            ->first();

        if (! $user) {
            throw new InvalidPasswordSetupTokenException();
        }

        $setupToken = PasswordSetupToken::where('user_id', $user->id)
            ->where('token', hash('sha256', $plaintextToken))
            ->latest('id')
            ->first();

        if (! $setupToken) {
            throw new InvalidPasswordSetupTokenException();
        }

        if ($setupToken->isUsed()) {
            throw new PasswordSetupTokenUsedException();
        }

        if ($setupToken->isExpired()) {
            throw new PasswordSetupTokenExpiredException();
        }

        $agency = DB::transaction(function () use ($user, $setupToken, $password) {
            $user->forceFill([
                'password' => $password,
                'email_verified_at' => now(),
            ])->save();

            $setupToken->update(['used_at' => now()]);

            $agency = $user->agencies()->first();
            $agency->update(['activated_at' => now()]);

            return $agency;
        });

        AgencyActivated::dispatch($agency);

        return [
            'user' => $user,
            'agency' => $agency,
            'token' => $user->createToken('api')->plainTextToken,
        ];
    }
}
