<?php

namespace App\Actions\Agency;

use App\Enums\AgencyStatus;
use App\Exceptions\AgencyAlreadyReviewedException;
use App\Models\Agency;
use App\Models\User;

class RefuseAgency
{
    public function handle(Agency $agency, User $admin, string $reason): Agency
    {
        if ($agency->isReviewed()) {
            throw new AgencyAlreadyReviewedException();
        }

        $agency->update([
            'status' => AgencyStatus::Refused,
            'refusal_reason' => $reason,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);

        return $agency;
    }
}
