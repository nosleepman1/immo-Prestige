<?php

namespace App\Http\Controllers;

use App\Models\Devise;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeviseRequest;
use App\Http\Requests\UpdateDeviseRequest;
use App\Http\Resources\DeviseRessource;

class DeviseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
         return DeviseRessource::collection(Devise::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDeviseRequest $request)
    {
        $devise = Devise::create($request->validated());
        return new DeviseRessource($devise);
    }

    /**
     * Display the specified resource.
     */
    public function show(Devise $devise)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDeviseRequest $request, Devise $devise)
    {
        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Devise $devise)
    {
        //
    }
}
