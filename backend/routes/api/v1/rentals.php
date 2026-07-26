<?php

use App\Http\Controllers\AgencyRentalApplicationController;
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
Route::prefix('agency')->middleware(['auth:sanctum', 'role:agency', 'password.set'])->group(function () {
    Route::get('/owners', [OwnerController::class, 'index']);
    Route::post('/owners', [OwnerController::class, 'store']);
    Route::get('/owners/{owner}', [OwnerController::class, 'show']);
    Route::put('/owners/{owner}', [OwnerController::class, 'update']);
    Route::delete('/owners/{owner}', [OwnerController::class, 'destroy']);

    Route::get('/rental-applications', [AgencyRentalApplicationController::class, 'index']);
    Route::get('/rental-applications/{application}', [AgencyRentalApplicationController::class, 'show']);
    Route::post('/rental-applications/{application}/accept', [AgencyRentalApplicationController::class, 'accept']);
    Route::post('/rental-applications/{application}/reject', [AgencyRentalApplicationController::class, 'reject'])
        ->name('agency.rental-applications.reject');
    Route::post('/rental-applications/{application}/request-documents', [AgencyRentalApplicationController::class, 'requestDocuments'])
        ->name('agency.rental-applications.request-documents');
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

    // Notification stream, shared by every role.
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
});
