<?php

namespace App\Http\Controllers;

use App\Actions\Agency\AcceptAgency;
use App\Actions\Agency\RefuseAgency;
use App\Http\Requests\RefuseAgencyRequest;
use App\Http\Resources\AgencyResource;
use App\Models\Agency;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminAgencyController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Agency::class);

        $agencies = Agency::query()
            ->with('documents')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->get();

        return AgencyResource::collection($agencies);
    }

    public function show(Agency $agency): AgencyResource
    {
        $this->authorize('view', $agency);

        return new AgencyResource($agency->load('documents'));
    }

    public function accept(Request $request, Agency $agency, AcceptAgency $acceptAgency): AgencyResource
    {
        $this->authorize('review', $agency);

        return AgencyResource::make($acceptAgency->handle($agency, $request->user()));
    }

    public function refuse(RefuseAgencyRequest $request, Agency $agency, RefuseAgency $refuseAgency): AgencyResource
    {
        $this->authorize('review', $agency);

        return AgencyResource::make($refuseAgency->handle($agency, $request->user(), $request->validated()['reason']));
    }
}
