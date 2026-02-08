<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'last_name' => 'sometimes|required|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'phone' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'id_document_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ];
    }
}
