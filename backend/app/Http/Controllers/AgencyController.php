<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgencyRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Http\Resources\AgencyResource;
use App\Http\Resources\UserResource;
use App\Models\User;

class AgencyController extends Controller
{
    public function __construct()
    {
        
    }

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
    public function store(StoreUserRequest $request, StoreAgencyRequest $agencyRequest)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $user = User::create($data);

        if ($user->role != 'agency') {
            $user->delete();
            return response()->json(['message' => 'User role must be agency to create an agency'], 400);
        }

        $agencyData = $agencyRequest->validated();
        $agencyData['user_id'] = $user->id;
        $agency = Agency::create($agencyData);
        return [
            new UserResource($user),
            new AgencyResource($agency)
        ];
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
        $agency->delete();
        return response()->json([
            'message' => 'Agency deleted successfully.'
        ], 200);
    
    }
}