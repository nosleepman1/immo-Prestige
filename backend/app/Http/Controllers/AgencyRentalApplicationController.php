<?php

namespace App\Http\Controllers;

use App\Actions\Rental\ReviewRentalApplication;
use App\Http\Requests\ReviewRentalApplicationRequest;
use App\Http\Resources\RentalApplicationResource;
use App\Models\Agency;
use App\Models\RentalApplication;
use App\Queries\AgencyRentalApplicationQuery;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * The agency's work queue: instructing the applications filed on its own
 * properties.
 */
class AgencyRentalApplicationController extends Controller
{
    public function index(Request $request, AgencyRentalApplicationQuery $query): AnonymousResourceCollection
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        return RentalApplicationResource::collection(
            $query->handle($agency, $request->only(['status', 'property_id', 'per_page']))
        );
    }

    public function show(RentalApplication $application): RentalApplicationResource
    {
        $this->authorize('review', $application);

        return new RentalApplicationResource(
            $application->load(['property.rentalDetail', 'applicant', 'documents'])
        );
    }

    public function accept(
        Request $request,
        RentalApplication $application,
        ReviewRentalApplication $review,
    ): RentalApplicationResource {
        $this->authorize('review', $application);

        return new RentalApplicationResource($review->accept($application, $request->user()));
    }

    public function reject(
        ReviewRentalApplicationRequest $request,
        RentalApplication $application,
        ReviewRentalApplication $review,
    ): RentalApplicationResource {
        $this->authorize('review', $application);

        return new RentalApplicationResource(
            $review->reject($application, $request->user(), $request->validated('rejection_reason'))
        );
    }

    public function requestDocuments(
        ReviewRentalApplicationRequest $request,
        RentalApplication $application,
        ReviewRentalApplication $review,
    ): RentalApplicationResource {
        $this->authorize('review', $application);

        return new RentalApplicationResource(
            $review->requestDocuments($application, $request->user(), $request->validated('requested_documents'))
        );
    }
}
