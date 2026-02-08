<?php

namespace App\Http\Controllers;

use App\Models\PropertyType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyTypeRequest;
use App\Http\Requests\UpdatePropertyTypeRequest;
use App\Http\Resources\PropertyTypeResource;

class PropertyTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PropertyTypeResource::collection(PropertyType::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePropertyTypeRequest $request)
    {
        // property type creation logic here
        $data = $request->validated();
        $propertyType = PropertyType::create($data);

        return response()->json(
            [
                ['message' => 'Property type created successfully'],
                'data' => $propertyType
            ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PropertyType $propertyType)
    {
        return response()->json($propertyType);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePropertyTypeRequest $request, PropertyType $propertyType)
    {
        // property type update logic here
        $data = $request->validated();
        $propertyType->update($data);

        return response()->json(
            [
                ['message' => 'Property type updated successfully'],
                'data' => $propertyType
            ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PropertyType $propertyType)
    {
        // property type deletion logic here
        $propertyType->delete();
        return response()->json(
            [
                ['message' => 'Property type deleted successfully']
            ], 200);
    }
}