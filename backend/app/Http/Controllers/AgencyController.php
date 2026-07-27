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
use App\Models\LeaseInstallment;
use App\Models\RentalApplication;
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

    public function stats(Request $request): JsonResponse
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        // 1. Basic Counters
        $propertiesCount = $agency->properties()->count();
        $applicationsCount = RentalApplication::where('agency_id', $agency->id)->count();
        $pendingApplicationsCount = RentalApplication::where('agency_id', $agency->id)
            ->whereIn('status', ['submitted', 'under_review', 'documents_requested'])
            ->count();
        $activeLeasesCount = $agency->leases()->where('status', 'active')->count();

        // 2. Revenue & Monthly Evolution (Last 6 Months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthLabel = mb_convert_case($date->translatedFormat('M'), MB_CASE_TITLE, 'UTF-8');
            $year = $date->year;
            $month = $date->month;

            $paidSum = LeaseInstallment::whereHas('lease', function ($q) use ($agency) {
                $q->where('agency_id', $agency->id);
            })
            ->whereYear('paid_at', $year)
            ->whereMonth('paid_at', $month)
            ->where('status', 'paid')
            ->sum('paid_amount');

            $leasesCount = $agency->leases()
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $applicationsMonthCount = RentalApplication::where('agency_id', $agency->id)
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $monthlyRevenue[] = [
                'month' => $monthLabel,
                'revenus' => (int) $paidSum,
                'baux' => $leasesCount,
                'demandes' => $applicationsMonthCount,
            ];
        }

        // 3. Property Distribution by Status/Transaction
        $propertyDistribution = [
            [
                'name' => 'En Location',
                'value' => $agency->properties()->where('transaction_type', 'rent')->count(),
                'color' => '#10B981',
            ],
            [
                'name' => 'En Vente',
                'value' => $agency->properties()->where('transaction_type', 'sale')->count(),
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Mixte / Vente & Location',
                'value' => $agency->properties()->where('transaction_type', 'both')->count(),
                'color' => '#F59E0B',
            ],
        ];

        return response()->json([
            'data' => [
                'counters' => [
                    'properties' => $propertiesCount,
                    'applications' => $applicationsCount,
                    'pending_applications' => $pendingApplicationsCount,
                    'active_leases' => $activeLeasesCount,
                ],
                'revenue_chart' => $monthlyRevenue,
                'property_distribution' => $propertyDistribution,
            ],
        ]);
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
