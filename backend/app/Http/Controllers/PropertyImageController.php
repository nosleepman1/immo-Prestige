<?php

namespace App\Http\Controllers;

use App\Models\PropertyImage;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyImageRequest;
use App\Http\Requests\UpdatePropertyImageRequest;

class PropertyImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // property images listing logic here
        return response()->json(PropertyImage::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePropertyImageRequest $request)
    {
        // property image creation logic here
        $data = $request->validated();
        $propertyImage = PropertyImage::create($data);

        return response()->json(
            [
                ['message' => 'Property image created successfully'],
                'data' => $propertyImage
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