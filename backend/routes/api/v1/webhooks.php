<?php

use App\Http\Controllers\PayDunyaWebhookController;
use Illuminate\Support\Facades\Route;

// Public (no auth). Authenticated by provider signature inside the action.
Route::post('/webhooks/paydunya', [PayDunyaWebhookController::class, 'handle'])
    ->name('webhooks.paydunya');
