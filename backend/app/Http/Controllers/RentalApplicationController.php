<?php

namespace App\Http\Controllers;

use App\Actions\Rental\CancelRentalApplication;
use App\Actions\Rental\SubmitRentalApplication;
use App\Actions\Rental\UploadApplicationDocument;
use App\Enums\RentalDocumentType;
use App\Http\Requests\StoreApplicationDocumentRequest;
use App\Http\Requests\StoreRentalApplicationRequest;
use App\Http\Resources\RentalApplicationDocumentResource;
use App\Http\Resources\RentalApplicationResource;
use App\Models\Property;
use App\Models\RentalApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * The candidate's side of an application.
 */
class RentalApplicationController extends Controller
{
    public function mine(Request $request): AnonymousResourceCollection
    {
        return RentalApplicationResource::collection(
            RentalApplication::query()
                ->where('applicant_user_id', $request->user()->id)
                ->with(['property.rentalDetail', 'property.images'])
                ->withCount('documents')
                ->latest()
                ->paginate(15)
        );
    }

    public function show(RentalApplication $application): RentalApplicationResource
    {
        $this->authorize('view', $application);

        return new RentalApplicationResource(
            $application->load(['property.rentalDetail', 'property.images', 'documents', 'applicant'])
        );
    }

    public function store(StoreRentalApplicationRequest $request, SubmitRentalApplication $submit): JsonResponse
    {
        $this->authorize('create', RentalApplication::class);

        $data = $request->validated();
        $property = Property::with('rentalDetail')->findOrFail($data['property_id']);
        unset($data['property_id']);

        $application = $submit->handle($property, $request->user(), $data);

        return RentalApplicationResource::make($application->load('property'))
            ->response()
            ->setStatusCode(201);
    }

    public function cancel(RentalApplication $application, CancelRentalApplication $cancel): RentalApplicationResource
    {
        $this->authorize('cancel', $application);

        return new RentalApplicationResource($cancel->handle($application));
    }

    public function storeDocument(
        StoreApplicationDocumentRequest $request,
        RentalApplication $application,
        UploadApplicationDocument $upload,
    ): JsonResponse {
        $this->authorize('attachDocument', $application);

        $document = $upload->handle(
            $application,
            $request->file('file'),
            RentalDocumentType::from($request->validated('type')),
        );

        return RentalApplicationDocumentResource::make($document)
            ->response()
            ->setStatusCode(201);
    }
}
