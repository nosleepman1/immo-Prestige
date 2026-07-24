<?php

namespace App\Http\Controllers;

use App\Actions\Moderation\ReviewReport;
use App\Http\Requests\ReviewReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminReportController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Report::class);

        $reports = Report::query()
            ->with('reporter')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->get();

        return ReportResource::collection($reports);
    }

    public function review(ReviewReportRequest $request, Report $report, ReviewReport $reviewReport): ReportResource
    {
        $this->authorize('review', Report::class);

        return ReportResource::make($reviewReport->handle($report, $request->validated()['status']));
    }
}
