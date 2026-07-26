<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * agency_id is derived from the authenticated agency. `user_id` is not
     * client-supplied: linking an owner to an account is a separate,
     * consent-bearing step, not a field on a form.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'last_name' => 'required|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'id_document_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ];
    }
}
