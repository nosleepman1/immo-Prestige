<?php

namespace App\Http\Requests;

use App\Enums\RentalDocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApplicationDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Deliberately narrow: a supporting document is a PDF or a photo of a
     * paper. Anything else on a private disk holding identity papers is a
     * liability, not a feature.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(RentalDocumentType::class)],
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.mimes' => 'Une pièce justificative doit être un PDF ou une image (JPG, PNG).',
            'file.max' => 'Une pièce justificative ne peut pas dépasser 5 Mo.',
        ];
    }
}
