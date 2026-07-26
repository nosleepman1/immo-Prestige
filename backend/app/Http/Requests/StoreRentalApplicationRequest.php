<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRentalApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * status, agency_id and applicant_user_id are all derived — the candidate
     * supplies only what they actually decide.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'desired_start_date' => 'required|date|after_or_equal:today',
            'desired_duration_months' => 'required|integer|min:1|max:120',
            'message' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'desired_start_date.after_or_equal' => 'La date d\'entrée souhaitée ne peut pas être dans le passé.',
        ];
    }
}
