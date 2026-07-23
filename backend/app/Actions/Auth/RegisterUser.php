<?php

namespace App\Actions\Auth;

use App\Data\RegisterUserData;
use App\Models\User;
use Illuminate\Auth\Events\Registered;

class RegisterUser
{
    public function handle(RegisterUserData $data): User
    {
        // Password is hashed by the model's 'hashed' cast — do not hash here.
        $user = User::create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => $data->password,
            'role' => $data->role,
        ]);

        // Native event: triggers the email verification notification.
        event(new Registered($user));

        return $user;
    }
}
