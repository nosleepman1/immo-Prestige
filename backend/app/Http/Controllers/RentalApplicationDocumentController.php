<?php

namespace App\Http\Controllers;

use App\Models\RentalApplicationDocument;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RentalApplicationDocumentController extends Controller
{
    /**
     * Supporting documents are identity papers and payslips: they live on the
     * private disk and are streamed here, behind the policy, rather than being
     * given a public URL that would outlive the application itself.
     */
    public function download(RentalApplicationDocument $document): StreamedResponse
    {
        $application = $document->application()->firstOrFail();

        $this->authorize('downloadDocument', $application);

        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }

    public function destroy(RentalApplicationDocument $document)
    {
        $application = $document->application()->firstOrFail();

        $this->authorize('attachDocument', $application);

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return response()->json(null, 204);
    }
}
