<?php

namespace App\Http\Controllers;

use App\Actions\Property\CreateProperty;
use App\Actions\Property\DeleteProperty;
use App\Actions\Property\PublishProperty;
use App\Actions\Property\UpdateProperty;
use App\Http\Requests\PropertySearchRequest;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Agency;
use App\Models\Property;
use App\Queries\PropertySearchQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PropertyController extends Controller
{
    /**
     * Public, paginated, filterable listing of published properties.
     */
    public function index(PropertySearchRequest $request, PropertySearchQuery $query): AnonymousResourceCollection
    {
        return PropertyResource::collection($query->handle($request->validated()));
    }

    /**
     * Public show of a published property; the owning agency and admins may also
     * view their own drafts. A hidden property is a 404 (existence not leaked).
     */
    public function show(Request $request, Property $property): PropertyResource
    {
        $property->load(['propertyType', 'agency', 'devise', 'images', 'saleDetail', 'rentalDetail']);

        // Route is public (no auth middleware): read the token guard explicitly
        // so a Bearer-authenticated owner/admin is recognised.
        $user = $request->user('sanctum');

        $isAgency = $user && (int) $property->agency?->user_id === $user->id;
        $visible = $property->isPublished() || ($user && ($user->isAdmin() || $isAgency));

        abort_unless($visible, 404);

        // The owner is agency-internal and never surfaces on a public listing.
        if ($isAgency || $user?->isAdmin()) {
            $property->load('owner');
        }

        return new PropertyResource($property);
    }

    /**
     * The authenticated agency's own properties (any status).
     */
    public function mine(Request $request): AnonymousResourceCollection
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        return PropertyResource::collection(
            $agency->properties()
                ->with(['propertyType', 'devise', 'images', 'saleDetail', 'rentalDetail', 'owner'])
                ->latest()->paginate(15)
        );
    }

    public function store(StorePropertyRequest $request, CreateProperty $createProperty): JsonResponse
    {
        $this->authorize('create', Property::class);

        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();
        $property = $createProperty->handle($agency, $request->validated());

        return PropertyResource::make($property->load(['propertyType', 'devise', 'saleDetail', 'rentalDetail']))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdatePropertyRequest $request, Property $property, UpdateProperty $updateProperty): PropertyResource
    {
        $this->authorize('update', $property);

        return PropertyResource::make($updateProperty->handle($property, $request->validated()));
    }

    public function destroy(Property $property, DeleteProperty $deleteProperty): JsonResponse
    {
        $this->authorize('delete', $property);

        $deleteProperty->handle($property);

        return response()->json(null, 204);
    }

    /**
     * Draft -> published. Guarded by three independent rules: active
     * subscription (subscription.active middleware, 402), plan quota (409) and
     * listing completeness (422) — each enforced in PublishProperty.
     */
    public function publish(Request $request, Property $property, PublishProperty $publishProperty): PropertyResource
    {
        $this->authorize('publish', $property);

        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        return PropertyResource::make($publishProperty->handle($property, $agency));
    }
}
