<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Supporting documents attached to an application: identity, payslips, employer
 * letter. These are personal records — they live on a private disk and are only
 * ever served through an authenticated, policy-checked route.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rental_application_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('file_path');
            $table->string('original_name');
            $table->unsignedInteger('size_bytes');
            $table->string('mime_type');
            $table->softDeletes();
            $table->timestamps();

            $table->index('rental_application_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_application_documents');
    }
};
