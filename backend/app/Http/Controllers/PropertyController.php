<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // show all properties for an agency
        return response()->json(Property::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePropertyRequest $request)
    {
        // property creation logic here
        $data = $request->validated();
        $property = Property::create($data);
        return response()->json($property, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        return response()->json($property);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePropertyRequest $request, Property $property)
    {
        // property update logic here
        $data = $request->validated();
        $property->update($data);

        return response()->json([
            'message' => 'Property updated successfully',
            'data' => $property
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Property $property)
    {
        // property deletion logic here
        $property->delete();
        return response()->json([
            'message' => 'Property deleted successfully'
        ], 200);
    }
}