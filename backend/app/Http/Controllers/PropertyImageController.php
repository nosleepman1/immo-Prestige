<?php

namespace App\Http\Controllers;

use App\Models\PropertyImage;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyImageRequest;
use App\Http\Requests\UpdatePropertyImageRequest;
use App\Http\Resources\PropertyImagesResource;
use App\Models\Property;

class PropertyImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

    }


    public function showPropertyImages(Property $property){

        return PropertyImagesResource::collection($property->images);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePropertyImageRequest $request, Property $property)
    {

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }


        if($request->hasFile('image_path')) {

            $imageFile = $request->file('image_path');
            $imagePath = $imageFile->store('property_images', 'public');

            PropertyImage::create([
                'property_id' =>$property->id,
                'image_path' => $imagePath
            ]);

        }
        return response()->json([
            'message'=> 'creation reusie',
            'data' => $property->images()->get()
        ]);
    }
    /**
     * Display the specified resource.
     */
    public function show(PropertyImage $propertyImage)
    {
        return response()->json($propertyImage);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePropertyImageRequest $request, PropertyImage $propertyImage)
    {
        // property image update logic here
        $data = $request->validated();
        $propertyImage->update($data);

        return response()->json([
            'message'=> 'creation reusie',
            'data' => $propertyImage->toArray()
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PropertyImage $propertyImage)
    {
        // property image deletion logic here
        $propertyImage->delete();
        return response()->json(
            [
                ['message' => 'Property image deleted successfully']
            ], 200);
    }
}
