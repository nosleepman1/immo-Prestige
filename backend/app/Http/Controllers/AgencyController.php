<?php

namespace App\Http\Controllers;

use App\Actions\Agency\DeleteAgency;
use App\Actions\Agency\UpdateAgency;
use App\Http\Requests\UpdateAgencyRequest;
use App\Http\Resources\AgencyResource;
use App\Models\Agency;
use Illuminate\Http\JsonResponse;

class AgencyController extends Controller
{
    public function update(UpdateAgencyRequest $request, Agency $agency, UpdateAgency $updateAgency): AgencyResource
    {
        $this->authorize('update', $agency);

        return AgencyResource::make($updateAgency->handle($agency, $request->validated()));
    }

    public function destroy(Agency $agency, DeleteAgency $deleteAgency): JsonResponse
    {
        $this->authorize('delete', $agency);

        $deleteAgency->handle($agency);

        return response()->json(null, 204);
    }
}
