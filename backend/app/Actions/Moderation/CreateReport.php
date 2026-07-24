<?php

namespace App\Actions\Moderation;

use App\Enums\ReportStatus;
use App\Models\Report;
use App\Models\User;

class CreateReport
{
    public function handle(User $reporter, string $reportableType, int $reportableId, string $reason, ?string $details): Report
    {
        return Report::create([
            'reporter_id' => $reporter->id,
            'reportable_type' => $reportableType,
            'reportable_id' => $reportableId,
            'reason' => $reason,
            'details' => $details,
            // Set explicitly: Eloquent's create() does not refetch DB column
            // defaults into the in-memory instance it returns.
            'status' => ReportStatus::Pending,
        ]);
    }
}
