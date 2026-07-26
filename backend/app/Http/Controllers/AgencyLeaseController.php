<?php

namespace App\Http\Controllers;

use App\Actions\Rental\GenerateLease;
use App\Actions\Rental\ReviewLeaseSignature;
use App\Http\Requests\GenerateLeaseRequest;
use App\Http\Requests\RejectSignatureRequest;
use App\Http\Resources\LeaseResource;
use App\Models\Agency;
use App\Models\Lease;
use App\Models\RentalApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * The agency's side: turning an accepted application into a lease, then
 * checking the signed paper that comes back.
 */
class AgencyLeaseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        return LeaseResource::collection(
            $agency->leases()
                ->with(['property:id,name,city', 'tenant:id,name,email'])
                ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
                ->when($request->query('property_id'), fn ($q, $v) => $q->where('property_id', $v))
                ->latest()
                ->paginate($request->integer('per_page') ?: 20)
                ->withQueryString()
        );
    }

    public function show(Lease $lease): LeaseResource
    {
        $this->authorize('view', $lease);

        return new LeaseResource($lease->load(['property', 'tenant', 'owner', 'agency']));
    }

    /**
     * RG-L08: only an accepted application becomes a lease. The action enforces
     * it; the policy only says whose application it is.
     */
    public function generate(
        GenerateLeaseRequest $request,
        RentalApplication $application,
        GenerateLease $generate,
    ): JsonResponse {
        $this->authorize('review', $application);

        $lease = $generate->handle($application, $request->validated());

        return LeaseResource::make($lease->load(['property', 'tenant']))
            ->response()
            ->setStatusCode(201);
    }

    public function validateSignature(
        Request $request,
        Lease $lease,
        ReviewLeaseSignature $review,
    ): LeaseResource {
        $this->authorize('reviewSignature', $lease);

        return new LeaseResource($review->validate($lease, $request->user()));
    }

    public function rejectSignature(
        RejectSignatureRequest $request,
        Lease $lease,
        ReviewLeaseSignature $review,
    ): LeaseResource {
        $this->authorize('reviewSignature', $lease);

        return new LeaseResource($review->reject($lease, $request->user(), $request->validated('reason')));
    }
}
