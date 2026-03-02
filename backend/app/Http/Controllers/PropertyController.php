<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Agency;
use Illuminate\Support\Facades\Auth;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PropertyResource::collection(Property::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePropertyRequest $request)
    {
        $agency = Agency::where('user_id', Auth::user()->id)->first();

        if (!$agency) {
            return response()->json(['message' => 'No agency found for the authenticated user.'], 404);
        }

        $data = $request->validated();

        $data['agency_id'] = $agency->id;

        $property = Property::create($data);

        return response()->json([
            'message' => 'Property created successfully',
            'data' => new PropertyResource($property)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        if(Auth::user()->id !== $property->agency->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new PropertyResource($property);
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
