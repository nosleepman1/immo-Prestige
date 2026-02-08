<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResubmitAgencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Only descriptive fields may change on resubmission; company_name, id_card
     * and email are fixed identifiers.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'manager_name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'activity_zone' => 'nullable|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
        ];
    }
}
