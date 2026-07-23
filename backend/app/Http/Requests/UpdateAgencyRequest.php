<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Partial update. user_id is never client-supplied (ownership is fixed).
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('agencies', 'company_name')->ignore($this->route('agency')),
            ],
            'description' => 'sometimes|required|string',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'phone' => 'sometimes|required|string|max:20',
            'id_card' => [
                'sometimes', 'required', 'string',
                Rule::unique('agencies', 'id_card')->ignore($this->route('agency')),
            ],
        ];
    }
}
