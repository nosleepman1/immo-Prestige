<?php

namespace App\Actions\User;

use App\Models\User;

class UpdateUser
{
    /**
     * Updates safe profile fields only. Role is never mutable here
     * (privilege-escalation guard) — it is filtered out upstream by the
     * FormRequest, and defensively ignored here.
     *
     * @param  array<string, mixed>  $data
     */
    public function handle(User $user, array $data): User
    {
        $user->fill(array_intersect_key($data, array_flip(['name', 'email', 'password'])));
        $user->save();

        return $user;
    }
}
