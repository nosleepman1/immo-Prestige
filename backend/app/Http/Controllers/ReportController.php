<?php

namespace App\Http\Controllers;

use App\Actions\Moderation\CreateReport;
use App\Http\Requests\StoreReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function store(StoreReportRequest $request, CreateReport $createReport): JsonResponse
    {
        $this->authorize('create', Report::class);

        $data = $request->validated();

        $report = $createReport->handle(
            $request->user(),
            $data['reportable_type'],
            $data['reportable_id'],
            $data['reason'],
            $data['details'] ?? null,
        );

        return ReportResource::make($report)->response()->setStatusCode(201);
    }
}
