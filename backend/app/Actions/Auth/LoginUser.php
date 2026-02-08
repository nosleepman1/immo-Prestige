<?php

namespace App\Actions\Auth;

use App\Exceptions\EmailNotVerifiedException;
use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class LoginUser
{
    /**
     * @return array{user: User, token: string}
     */
    public function handle(string $email, string $password): array
    {
        $user = User::whereEmail(strtolower($email))->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new InvalidCredentialsException();
        }

        if (! $user->hasVerifiedEmail()) {
            throw new EmailNotVerifiedException();
        }

        return [
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ];
    }
}
