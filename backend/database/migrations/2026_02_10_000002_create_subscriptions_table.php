<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['trialing', 'active', 'expired', 'cancelled'])->default('trialing');
            // Frozen at billing time so a later plan edit never rewrites history.
            $table->unsignedBigInteger('price_snapshot')->nullable();
            $table->json('quota_snapshot')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['agency_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
