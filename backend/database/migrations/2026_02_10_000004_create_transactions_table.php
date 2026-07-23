<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Immutable journal of gateway events (IPN). Source of truth for payments.
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->string('event');
            $table->string('external_ref')->nullable();
            $table->boolean('signature_valid')->default(false);
            $table->json('payload');
            $table->timestamps();

            $table->index('external_ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
