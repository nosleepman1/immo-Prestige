<?php

namespace App\Actions\Rental;

use App\Models\LeaseInstallment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/**
 * Produces the receipt for a settled instalment.
 *
 * Only for a fully settled month: a receipt is proof that a period is paid, and
 * issuing one for a partial payment would hand the tenant a document saying
 * more than the truth.
 *
 * Rendered once and kept: the same period must always yield the same paper,
 * even if a later correction touches the ledger.
 */
class RenderInstallmentReceipt
{
    public function handle(LeaseInstallment $installment, bool $force = false): string
    {
        if (! $installment->isSettled()) {
            throw ValidationException::withMessages([
                'installment' => 'Une quittance ne peut être délivrée que pour une échéance intégralement réglée.',
            ]);
        }

        if (! $force && $installment->receipt_path && Storage::disk('local')->exists($installment->receipt_path)) {
            return $installment->receipt_path;
        }

        $installment->loadMissing(['lease.agency', 'lease.tenant', 'lease.property']);

        $pdf = Pdf::loadView('pdf.installment-receipt', [
            'installment' => $installment,
            'lease' => $installment->lease,
            'payments' => $installment->payments()->with('validator')->get(),
            'money' => fn (int $amount) => number_format($amount, 0, ',', ' ').' FCFA',
        ])->setPaper('a4');

        $path = "leases/{$installment->lease_id}/receipts/{$installment->reference}.pdf";
        Storage::disk('local')->put($path, $pdf->output());

        $installment->update(['receipt_path' => $path]);

        return $path;
    }
}
