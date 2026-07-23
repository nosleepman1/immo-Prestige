<?php

namespace App\Http\Controllers;

use App\Actions\Agency\DeleteAgency;
use App\Actions\Agency\RegisterAgency;
use App\Actions\Agency\ResubmitAgency;
use App\Actions\Agency\SetAgencyPassword;
use App\Actions\Agency\UpdateAgency;
use App\Data\RegisterAgencyData;
use App\Http\Requests\RegisterAgencyRequest;
use App\Http\Requests\ResubmitAgencyRequest;
use App\Http\Requests\SetAgencyPasswordRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Http\Resources\AgencyResource;
use App\Http\Resources\UserResource;
use App\Models\Agency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    public function register(RegisterAgencyRequest $request, RegisterAgency $registerAgency): JsonResponse
    {
        $documents = array_filter([
            'id_card' => $request->file('id_card_document'),
            'business_registry' => $request->file('business_registry_document'),
            'proof_of_address' => $request->file('proof_of_address_document'),
        ]);

        $agency = $registerAgency->handle(RegisterAgencyData::fromArray($request->validated()), $documents);

        $token = $agency->user()->first()->createToken('api')->plainTextToken;

        return response()->json([
            'data' => [
                'agency' => new AgencyResource($agency),
                'access_token' => $token,
            ],
        ], 201);
    }

    public function me(Request $request): AgencyResource
    {
        return new AgencyResource(Agency::whereBelongsTo($request->user())->firstOrFail());
    }

    public function resubmit(ResubmitAgencyRequest $request, ResubmitAgency $resubmitAgency): AgencyResource
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        return AgencyResource::make($resubmitAgency->handle($agency, $request->validated()));
    }

    public function setPassword(SetAgencyPasswordRequest $request, SetAgencyPassword $setPassword): JsonResponse
    {
        $data = $request->validated();

        $result = $setPassword->handle($data['email'], $data['token'], $data['password']);

        return response()->json([
            'data' => [
                'user' => new UserResource($result['user']),
                'agency' => new AgencyResource($result['agency']),
                'access_token' => $result['token'],
            ],
        ]);
    }

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
