<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadSignedContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * A scanned contract runs to several pages: 10 Mo, against 5 for a single
     * supporting document.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.mimes' => 'Le contrat signé doit être un PDF ou une image (JPG, PNG).',
            'file.max' => 'Le contrat signé ne peut pas dépasser 10 Mo.',
        ];
    }
}
