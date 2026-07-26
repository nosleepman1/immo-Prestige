<?php

namespace App\Actions\Rental;

use App\Enums\PropertyAvailability;
use App\Enums\RentalApplicationStatus;
use App\Exceptions\DuplicateRentalApplicationException;
use App\Exceptions\PropertyNotOpenToApplicationsException;
use App\Models\Property;
use App\Models\RentalApplication;
use App\Models\User;
use App\Notifications\RentalApplicationSubmitted;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class SubmitRentalApplication
{
    /**
     * @param  array<string, mixed>  $data
     *
     * @throws PropertyNotOpenToApplicationsException|DuplicateRentalApplicationException
     */
    public function handle(Property $property, User $applicant, array $data): RentalApplication
    {
        $this->assertOpenToApplications($property);
        $this->assertMinimumDuration($property, (int) $data['desired_duration_months']);

        try {
            $application = RentalApplication::create([
                ...$data,
                'property_id' => $property->id,
                'agency_id' => $property->agency_id,
                'applicant_user_id' => $applicant->id,
                'status' => RentalApplicationStatus::Submitted,
            ]);
        } catch (UniqueConstraintViolationException) {
            // The partial unique index caught a double submit the PHP check
            // could not see — two requests in the same instant.
            throw new DuplicateRentalApplicationException();
        }

        // After the commit: a failed mail must never roll back the application.
        DB::afterCommit(function () use ($application, $property) {
            $agencyUser = $property->agency()->with('user')->first()?->user;

            $agencyUser?->notify(new RentalApplicationSubmitted(
                $application->load(['property', 'applicant'])
            ));
        });

        return $application;
    }

    /**
     * RG-L04.
     */
    private function assertOpenToApplications(Property $property): void
    {
        if (! $property->isPublished()) {
            throw new PropertyNotOpenToApplicationsException("il n'est pas publié");
        }

        if (! $property->isRentable()) {
            throw new PropertyNotOpenToApplicationsException("il n'est pas proposé à la location");
        }

        if ($property->availability !== PropertyAvailability::Available) {
            throw new PropertyNotOpenToApplicationsException('il n\'est plus disponible');
        }
    }

    /**
     * RG-L10 applied at the door rather than at lease generation: telling a
     * candidate the duration is too short after they have assembled a full file
     * would be a poor way to find out.
     */
    private function assertMinimumDuration(Property $property, int $months): void
    {
        $minimum = $property->rentalDetail()->value('min_lease_months');

        if ($minimum !== null && $months < $minimum) {
            throw new PropertyNotOpenToApplicationsException(
                "la durée minimale de location est de {$minimum} mois"
            );
        }
    }
}
