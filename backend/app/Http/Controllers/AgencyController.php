<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgencyRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Http\Resources\AgencyResource;
use App\Models\User;

class AgencyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return AgencyResource::collection(Agency::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAgencyRequest $request,)
    {
        $agency = Agency::create($request->validated());
        return new AgencyResource($agency);
    }

    /**
     * Display the specified resource.
     */
    public function show(Agency $agency)
    {
        return new AgencyResource($agency);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAgencyRequest $request, Agency $agency)
    {
        $agency->update($request->validated());
        return new AgencyResource($agency);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Agency $agency)
    {
        //
    }
}