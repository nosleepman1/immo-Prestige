<?php

use App\Http\Controllers\AgencyInstallmentController;
use App\Http\Controllers\AgencyLeaseController;
use App\Http\Controllers\AgencyMaintenanceController;
use App\Http\Controllers\AgencyRentalApplicationController;
use App\Http\Controllers\AgencyRentalDashboardController;
use App\Http\Controllers\ContractTemplateController;
use App\Http\Controllers\LeaseController;
use App\Http\Controllers\LeaseInstallmentController;
use App\Http\Controllers\MaintenanceTicketController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\RentalApplicationController;
use App\Http\Controllers\RentalApplicationDocumentController;
use Illuminate\Support\Facades\Route;

// ---------------------------------------------------------------------------
// Agency side. Owners and the application queue are agency-internal: the whole
// group sits behind the agency role, and the policies scope each record to its
// own agency.
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:agency'])->prefix('agency')->group(function () {
    Route::get('/rental-applications', [AgencyRentalApplicationController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'role:agency', 'password.set'])->prefix('agency')->group(function () {
    Route::get('/owners', [OwnerController::class, 'index']);
    Route::post('/owners', [OwnerController::class, 'store']);
    Route::get('/owners/{owner}', [OwnerController::class, 'show']);
    Route::put('/owners/{owner}', [OwnerController::class, 'update']);
    Route::delete('/owners/{owner}', [OwnerController::class, 'destroy']);

    Route::get('/rental-applications/{application}', [AgencyRentalApplicationController::class, 'show']);
    Route::post('/rental-applications/{application}/accept', [AgencyRentalApplicationController::class, 'accept']);
    Route::post('/rental-applications/{application}/reject', [AgencyRentalApplicationController::class, 'reject'])
        ->name('agency.rental-applications.reject');
    Route::post('/rental-applications/{application}/request-documents', [AgencyRentalApplicationController::class, 'requestDocuments'])
        ->name('agency.rental-applications.request-documents');

    // Lease templates: the agency's own articles.
    Route::get('/contract-variables', [ContractTemplateController::class, 'variables']);
    Route::get('/contract-templates', [ContractTemplateController::class, 'index']);
    Route::post('/contract-templates', [ContractTemplateController::class, 'store']);
    Route::get('/contract-templates/{template}', [ContractTemplateController::class, 'show']);
    Route::put('/contract-templates/{template}', [ContractTemplateController::class, 'update']);
    Route::delete('/contract-templates/{template}', [ContractTemplateController::class, 'destroy']);
    Route::post('/contract-templates/{template}/clauses', [ContractTemplateController::class, 'storeClause']);
    Route::put('/contract-templates/{template}/clauses/order', [ContractTemplateController::class, 'reorderClauses']);
    Route::put('/clauses/{clause}', [ContractTemplateController::class, 'updateClause']);
    Route::delete('/clauses/{clause}', [ContractTemplateController::class, 'destroyClause']);

    // Leases.
    Route::post('/rental-applications/{application}/generate-lease', [AgencyLeaseController::class, 'generate']);
    Route::get('/leases', [AgencyLeaseController::class, 'index']);
    Route::get('/leases/{lease}', [AgencyLeaseController::class, 'show']);
    Route::post('/leases/{lease}/validate-signature', [AgencyLeaseController::class, 'validateSignature']);
    Route::post('/leases/{lease}/reject-signature', [AgencyLeaseController::class, 'rejectSignature']);

    // Ledger.
    Route::get('/installments', [AgencyInstallmentController::class, 'index']);
    Route::post('/leases/{lease}/record-cash-payment', [AgencyInstallmentController::class, 'recordCash']);
    Route::post('/leases/{lease}/record-cash-initial', [AgencyInstallmentController::class, 'recordCashInitial']);

    // What the agency does today.
    Route::get('/dashboard/rental', AgencyRentalDashboardController::class);

    // Maintenance queue.
    Route::get('/tickets', [AgencyMaintenanceController::class, 'index']);
    Route::get('/tickets/{ticket}', [AgencyMaintenanceController::class, 'show']);
    Route::patch('/tickets/{ticket}/status', [AgencyMaintenanceController::class, 'updateStatus']);
    Route::post('/tickets/{ticket}/messages', [MaintenanceTicketController::class, 'storeMessage']);
    Route::post('/tickets/{ticket}/images', [MaintenanceTicketController::class, 'storeImage']);
});

// ---------------------------------------------------------------------------
// Candidate side.
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/rental-applications/mine', [RentalApplicationController::class, 'mine']);
    Route::post('/rental-applications', [RentalApplicationController::class, 'store']);
    Route::get('/rental-applications/{application}', [RentalApplicationController::class, 'show']);
    Route::delete('/rental-applications/{application}', [RentalApplicationController::class, 'cancel']);
    Route::post('/rental-applications/{application}/documents', [RentalApplicationController::class, 'storeDocument']);

    // Private files: streamed behind the policy, never given a public URL.
    Route::get('/rental-application-documents/{document}', [RentalApplicationDocumentController::class, 'download'])
        ->name('rental-application-documents.download');
    Route::delete('/rental-application-documents/{document}', [RentalApplicationDocumentController::class, 'destroy']);

    // Leases, tenant side.
    Route::get('/leases/mine', [LeaseController::class, 'mine']);
    Route::get('/leases/{lease}', [LeaseController::class, 'show']);
    Route::get('/leases/{lease}/contract', [LeaseController::class, 'downloadContract']);
    Route::get('/leases/{lease}/signed-contract', [LeaseController::class, 'downloadSignedContract']);
    Route::post('/leases/{lease}/validate', [LeaseController::class, 'validateTerms']);
    Route::post('/leases/{lease}/signed-contract', [LeaseController::class, 'uploadSignature']);

    // Ledger, tenant side.
    Route::get('/leases/{lease}/installments', [LeaseInstallmentController::class, 'index']);
    Route::post('/leases/{lease}/initial-payment/checkout', [LeaseInstallmentController::class, 'checkoutInitial']);
    Route::post('/leases/{lease}/installments/checkout', [LeaseInstallmentController::class, 'checkout']);
    Route::get('/installments/{installment}/receipt', [LeaseInstallmentController::class, 'receipt']);

    // Maintenance, tenant side.
    Route::get('/leases/{lease}/tickets', [MaintenanceTicketController::class, 'index']);
    Route::post('/leases/{lease}/tickets', [MaintenanceTicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [MaintenanceTicketController::class, 'show']);
    Route::post('/tickets/{ticket}/messages', [MaintenanceTicketController::class, 'storeMessage']);
    Route::post('/tickets/{ticket}/images', [MaintenanceTicketController::class, 'storeImage']);

    // Notification stream, shared by every role.
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
});
