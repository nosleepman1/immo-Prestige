<?php

namespace App\Queries;

use App\Models\Agency;
use App\Models\RentalApplication;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * The agency's application queue. Ordered oldest first on purpose: this is a
 * work list, and the candidate who has waited longest is the one at risk of
 * going elsewhere.
 */
class AgencyRentalApplicationQuery
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function handle(Agency $agency, array $filters): LengthAwarePaginator
    {
        return RentalApplication::query()
            ->where('agency_id', $agency->id)
            ->with(['property:id,name,city', 'applicant:id,name,email'])
            ->withCount('documents')
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['property_id'] ?? null, fn ($q, $v) => $q->where('property_id', $v))
            ->oldest()
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();
    }
}
