<?php

namespace App\Policies;

use App\Models\ContractTemplate;
use App\Models\User;

/**
 * A template holds the clauses an agency has drafted — its own legal work.
 * Strictly limited to the owning agency, admins included.
 */
class ContractTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAgency();
    }

    public function view(User $user, ContractTemplate $template): bool
    {
        return $this->owns($user, $template);
    }

    public function create(User $user): bool
    {
        return $user->isAgency();
    }

    public function update(User $user, ContractTemplate $template): bool
    {
        return $this->owns($user, $template);
    }

    public function delete(User $user, ContractTemplate $template): bool
    {
        return $this->owns($user, $template);
    }

    private function owns(User $user, ContractTemplate $template): bool
    {
        return (int) $template->agency()->value('user_id') === $user->id;
    }
}
