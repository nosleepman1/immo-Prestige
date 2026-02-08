<?php

namespace App\Http\Controllers;

use App\Actions\Subscription\CheckoutSubscription;
use App\Http\Requests\CheckoutSubscriptionRequest;
use App\Http\Resources\PlanResource;
use App\Http\Resources\SubscriptionResource;
use App\Models\Agency;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubscriptionController extends Controller
{
    public function plans(): AnonymousResourceCollection
    {
        return PlanResource::collection(
            Plan::where('is_active', true)->orderBy('billing_period_months')->get()
        );
    }

    public function current(Request $request): SubscriptionResource
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        return new SubscriptionResource($agency->subscription()->with('plan')->firstOrFail());
    }

    public function checkout(CheckoutSubscriptionRequest $request, CheckoutSubscription $checkout): JsonResponse
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();
        $plan = Plan::findOrFail($request->validated()['plan_id']);

        $result = $checkout->handle($agency, $plan);

        return response()->json([
            'data' => [
                'payment_id' => $result['payment']->id,
                'redirect_url' => $result['redirect_url'],
            ],
        ], 201);
    }
}
