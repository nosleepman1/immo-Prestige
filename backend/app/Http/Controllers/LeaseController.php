<?php

namespace App\Http\Controllers;

use App\Actions\Rental\UploadSignedContract;
use App\Actions\Rental\ValidateLeaseTerms;
use App\Http\Requests\UploadSignedContractRequest;
use App\Http\Resources\LeaseResource;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The tenant's side of a lease: read it, accept its terms, send back the signed
 * paper.
 */
class LeaseController extends Controller
{
    public function mine(Request $request): AnonymousResourceCollection
    {
        return LeaseResource::collection(
            Lease::query()
                ->where('tenant_user_id', $request->user()->id)
                ->with(['property.images', 'agency'])
                ->latest()
                ->paginate(15)
        );
    }

    public function show(Lease $lease): LeaseResource
    {
        $this->authorize('view', $lease);

        return new LeaseResource($lease->load(['property.images', 'agency', 'tenant', 'owner']));
    }

    /**
     * The generated contract. Streamed behind the policy — it carries both
     * parties' identity and the rent they agreed on.
     */
    public function downloadContract(Lease $lease): StreamedResponse
    {
        $this->authorize('downloadContract', $lease);

        abort_if($lease->generated_contract_path === null, 404);
        abort_unless(Storage::disk('local')->exists($lease->generated_contract_path), 404);

        return Storage::disk('local')->download(
            $lease->generated_contract_path,
            "contrat-{$lease->reference}.pdf"
        );
    }

    public function downloadSignedContract(Lease $lease): StreamedResponse
    {
        $this->authorize('downloadContract', $lease);

        abort_if($lease->signed_contract_path === null, 404);
        abort_unless(Storage::disk('local')->exists($lease->signed_contract_path), 404);

        return Storage::disk('local')->download($lease->signed_contract_path);
    }

    public function validateTerms(Lease $lease, ValidateLeaseTerms $validate): LeaseResource
    {
        $this->authorize('validateTerms', $lease);

        return new LeaseResource($validate->handle($lease));
    }

    public function uploadSignature(
        UploadSignedContractRequest $request,
        Lease $lease,
        UploadSignedContract $upload,
    ): LeaseResource {
        $this->authorize('uploadSignature', $lease);

        return new LeaseResource($upload->handle($lease, $request->file('file')));
    }
}
