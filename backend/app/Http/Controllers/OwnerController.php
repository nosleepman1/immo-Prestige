<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOwnerRequest;
use App\Http\Requests\UpdateOwnerRequest;
use App\Http\Resources\OwnerResource;
use App\Models\Agency;
use App\Models\Owner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OwnerController extends Controller
{
    /**
     * The authenticated agency's own owners.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Owner::class);

        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        return OwnerResource::collection(
            $agency->owners()
                ->withCount('properties')
                ->orderBy('last_name')
                ->paginate(20)
        );
    }

    public function show(Owner $owner): OwnerResource
    {
        $this->authorize('view', $owner);

        return new OwnerResource($owner->loadCount('properties'));
    }

    public function store(StoreOwnerRequest $request): JsonResponse
    {
        $this->authorize('create', Owner::class);

        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        $owner = $agency->owners()->create($request->validated());

        return OwnerResource::make($owner)->response()->setStatusCode(201);
    }

    public function update(UpdateOwnerRequest $request, Owner $owner): OwnerResource
    {
        $this->authorize('update', $owner);

        $owner->update($request->validated());

        return new OwnerResource($owner);
    }

    /**
     * Soft delete. The properties keep their history: `owner_id` is nulled by
     * the foreign key only on a hard delete, so a restored owner finds its
     * portfolio intact.
     */
    public function destroy(Owner $owner): JsonResponse
    {
        $this->authorize('delete', $owner);

        $owner->delete();

        return response()->json(null, 204);
    }
}
