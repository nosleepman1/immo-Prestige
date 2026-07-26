<?php

namespace App\Actions\Rental;

use App\Enums\RentalDocumentType;
use App\Exceptions\RentalApplicationNotOpenException;
use App\Exceptions\TooManyApplicationDocumentsException;
use App\Models\RentalApplication;
use App\Models\RentalApplicationDocument;
use Illuminate\Http\UploadedFile;

class UploadApplicationDocument
{
    public const MAX_DOCUMENTS = 10;

    /**
     * Stored on the private `local` disk, never on `public`: these are identity
     * papers and payslips. They are only ever served through an authenticated,
     * policy-checked download route.
     *
     * @throws RentalApplicationNotOpenException
     */
    public function handle(
        RentalApplication $application,
        UploadedFile $file,
        RentalDocumentType $type,
    ): RentalApplicationDocument {
        if (! $application->status->isActive()) {
            throw new RentalApplicationNotOpenException('complétée');
        }

        if ($application->documents()->count() >= self::MAX_DOCUMENTS) {
            throw new TooManyApplicationDocumentsException(self::MAX_DOCUMENTS);
        }

        return $application->documents()->create([
            'type' => $type,
            'file_path' => $file->store('rental-applications/'.$application->id, 'local'),
            'original_name' => $file->getClientOriginalName(),
            'size_bytes' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);
    }
}
