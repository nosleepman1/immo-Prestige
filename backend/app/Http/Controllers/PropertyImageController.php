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


    public function showPropertyImage(Property $property){
        
        return PropertyImagesResource::collection($property->images);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePropertyImageRequest $request)
    {
        $property = Property::find($request->property_id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        if($request->hasFile('image')) {
            foreach($request->file('image') as $imageFile) {
              
                $imagePath = $imageFile->store('property_images', 'public');

                PropertyImage::create([
                    'property_id' => $request->property_id,
                    'image_path' => $imagePath,
                    'is_cover' => $request->is_cover,
                ]);
            }
        }
        return response()->json(
            [
                ['message' => 'Property image(s) created successfully'],
                'data' => PropertyImage::where('property_id', $request->property_id)->get()
            ], 201);
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

        return response()->json(
            [
                ['message' => 'Property image updated successfully'],
                'data' => $propertyImage
            ], 200);
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