<?php

namespace App\Actions\Agency;

use App\Data\RegisterAgencyData;
use App\Enums\AgencyStatus;
use App\Enums\UserRole;
use App\Models\Agency;
use App\Models\AgencyDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Orchestrator: creates the (password-less) agency account, the agency in
 * `pending` state and its documents in one transaction, then notifies admins.
 */
class RegisterAgency
{
    public function __construct(private NotifyAdminsOfAgencyRequest $notifyAdmins) {}

    /**
     * @param  array<string, UploadedFile>  $documents  keyed by document type
     */
    public function handle(RegisterAgencyData $data, array $documents): Agency
    {
        $agency = DB::transaction(function () use ($data, $documents) {
           
            $user = User::create([
                'name' => $data->managerName,
                'email' => $data->email,
                'role' => UserRole::Agency,
                'password' => null,
            ]);

            $agency = Agency::create([
                'company_name' => $data->companyName,
                'manager_name' => $data->managerName,
                'description' => $data->description,
                'address' => $data->address,
                'city' => $data->city,
                'activity_zone' => $data->activityZone,
                'phone' => $data->phone,
                'id_card' => $data->idCard,
                'status' => AgencyStatus::Pending,
                'user_id' => $user->id,
            ]);

            $this->storeDocuments($agency, $documents);

            return $agency;
        });

        // After commit: queued mail to admins.
        $this->notifyAdmins->handle($agency);

        return $agency->load('documents');
    }

    /**
     * @param  array<string, UploadedFile>  $documents
     */
    private function storeDocuments(Agency $agency, array $documents): void
    {
        foreach ($documents as $type => $file) {
            AgencyDocument::create([
                'agency_id' => $agency->id,
                'type' => $type,
                'path' => $file->store('agency_documents', 'public'),
                'original_name' => $file->getClientOriginalName(),
            ]);
        }
    }
}
