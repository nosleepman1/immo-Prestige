<?php

namespace App\Actions\Agency;

use App\Enums\AgencyStatus;
use App\Exceptions\AgencyNotRefusedException;
use App\Models\Agency;

class ResubmitAgency
{
    public function __construct(private NotifyAdminsOfAgencyRequest $notifyAdmins) {}

    /**
     * @param  array<string, mixed>  $data  updated agency fields (optional)
     */
    public function handle(Agency $agency, array $data): Agency
    {
        if ($agency->status !== AgencyStatus::Refused) {
            throw new AgencyNotRefusedException();
        }

        $agency->update(array_merge($data, [
            'status' => AgencyStatus::Pending,
            'refusal_reason' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]));

        $this->notifyAdmins->handle($agency);

        return $agency;
    }
}
