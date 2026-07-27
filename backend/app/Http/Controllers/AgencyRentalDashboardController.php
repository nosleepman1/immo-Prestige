<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Queries\AgencyRentalDashboardQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * What the agency does today: what is owed, what is late, what is empty, what
 * is waiting for them.
 */
class AgencyRentalDashboardController extends Controller
{
    public function __invoke(Request $request, AgencyRentalDashboardQuery $query): JsonResponse
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        return response()->json(['data' => $query->handle($agency)]);
    }
}
