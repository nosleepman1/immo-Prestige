<?php

namespace App\Http\Controllers;

use App\Actions\Property\DeleteProperty;
use App\Actions\Property\UpdateProperty;
use App\Http\Requests\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\JsonResponse;

class PropertyController extends Controller
{
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
}
