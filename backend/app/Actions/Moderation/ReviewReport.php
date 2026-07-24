<?php

namespace App\Actions\Moderation;

use App\Models\Report;

class ReviewReport
{
    public function handle(Report $report, string $status): Report
    {
        $report->update(['status' => $status]);

        return $report;
    }
}
