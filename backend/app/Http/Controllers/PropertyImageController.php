<?php

namespace App\Http\Controllers;

use App\Actions\Property\DeletePropertyImage;
use App\Actions\Property\ReorderPropertyImages;
use App\Actions\Property\SetCoverPropertyImage;
use App\Actions\Property\UploadPropertyImage;
use App\Http\Requests\ReorderPropertyImagesRequest;
use App\Http\Requests\StorePropertyImageRequest;
use App\Http\Resources\PropertyImageResource;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PropertyImageController extends Controller
{
    public function index(Property $property): AnonymousResourceCollection
    {
        return PropertyImageResource::collection($property->images);
    }

    public function store(StorePropertyImageRequest $request, Property $property, UploadPropertyImage $upload): JsonResponse
    {
        $this->authorize('uploadImages', $property);

        $image = $upload->handle($property, $request->file('image'));

        return PropertyImageResource::make($image)->response()->setStatusCode(201);
    }

    public function reorder(ReorderPropertyImagesRequest $request, Property $property, ReorderPropertyImages $reorder): AnonymousResourceCollection
    {
        $this->authorize('update', $property);

        $reorder->handle($property, $request->validated()['image_ids']);

        return PropertyImageResource::collection($property->images()->get());
    }

    public function setCover(PropertyImage $propertyImage, SetCoverPropertyImage $setCover): PropertyImageResource
    {
        $this->authorize('update', $propertyImage);

        return PropertyImageResource::make($setCover->handle($propertyImage));
    }

    public function destroy(PropertyImage $propertyImage, DeletePropertyImage $delete): JsonResponse
    {
        $this->authorize('delete', $propertyImage);

        $delete->handle($propertyImage);

        return response()->json(null, 204);
    }
}
