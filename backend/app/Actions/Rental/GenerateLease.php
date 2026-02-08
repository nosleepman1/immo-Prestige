<?php

namespace App\Actions\Rental;

use App\Enums\LeaseStatus;
use App\Enums\RentalApplicationStatus;
use App\Exceptions\RentalApplicationNotOpenException;
use App\Models\ContractTemplate;
use App\Models\Lease;
use App\Models\RentalApplication;
use App\Notifications\LeaseContractAvailable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Turns an accepted application into a lease and its PDF.
 *
 * This is where RG-L09 is applied: every amount is copied from the listing onto
 * the lease and never read back. Re-pricing a property tomorrow must not rewrite
 * what a tenant signed today.
 */
class GenerateLease
{
    public function __construct(private readonly RenderLeaseContract $render) {}

    /**
     * @param  array<string, mixed>  $data
     *
     * @throws RentalApplicationNotOpenException
     */
    public function handle(RentalApplication $application, array $data): Lease
    {
        // RG-L08.
        if ($application->status !== RentalApplicationStatus::Accepted) {
            throw new RentalApplicationNotOpenException('transformée en bail');
        }

        $application->loadMissing(['property.rentalDetail', 'property.owner']);
        $property = $application->property;
        $terms = $property->rentalDetail;

        if ($terms === null) {
            throw ValidationException::withMessages([
                'property' => 'Ce bien ne porte plus de conditions de location.',
            ]);
        }

        $months = (int) ($data['duration_months'] ?? $application->desired_duration_months);
        $this->assertDurationAllowed($months, $terms->min_lease_months);

        $start = Carbon::parse($data['start_date'] ?? $application->desired_start_date);

        $lease = DB::transaction(function () use ($application, $property, $terms, $data, $months, $start) {
            $lease = Lease::create([
                'reference' => Lease::nextReference(),
                'property_id' => $property->id,
                'agency_id' => $application->agency_id,
                'tenant_user_id' => $application->applicant_user_id,
                'owner_id' => $property->owner_id,
                'rental_application_id' => $application->id,
                'contract_template_id' => $this->resolveTemplate($application->agency_id, $data)?->id,

                'start_date' => $start->toDateString(),
                // A twelve-month lease starting on the 1st ends on the last day
                // of the twelfth month, not on the 1st of the thirteenth.
                'end_date' => $start->copy()->addMonths($months)->subDay()->toDateString(),
                'duration_months' => $months,

                // Frozen — RG-L09.
                'rent_amount' => $terms->rent_amount,
                'charges_amount' => $terms->charges_amount,
                'deposit_amount' => $terms->deposit_amount,
                'advance_months' => $terms->advance_months,

                'periodicity' => $data['periodicity'] ?? 'monthly',
                'payment_day' => $data['payment_day'] ?? 5,
                'notice_period_days' => $data['notice_period_days'] ?? 30,
                'status' => LeaseStatus::PendingValidation,
            ]);

            // Inside the transaction: a lease whose PDF failed to render would
            // sit in `pending_validation` with nothing for the tenant to read.
            $lease->update(['generated_contract_path' => $this->render->handle($lease)]);

            return $lease;
        });

        DB::afterCommit(fn () => $lease->tenant?->notify(
            new LeaseContractAvailable($lease->load(['property', 'agency']))
        ));

        return $lease;
    }

    /**
     * RG-L10.
     */
    private function assertDurationAllowed(int $months, ?int $minimum): void
    {
        if ($minimum !== null && $months < $minimum) {
            throw ValidationException::withMessages([
                'duration_months' => "La durée minimale de location de ce bien est de {$minimum} mois.",
            ]);
        }
    }

    /**
     * The agency may name a template; otherwise its default one is used. A lease
     * with no template at all is allowed — the platform's own structure stands
     * on its own, it simply carries no particular articles.
     *
     * @param  array<string, mixed>  $data
     */
    private function resolveTemplate(int $agencyId, array $data): ?ContractTemplate
    {
        if (! empty($data['contract_template_id'])) {
            return ContractTemplate::where('agency_id', $agencyId)
                ->findOrFail($data['contract_template_id']);
        }

        return ContractTemplate::where('agency_id', $agencyId)
            ->where('is_default', true)
            ->first();
    }
}
