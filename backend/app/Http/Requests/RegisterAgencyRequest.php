<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterAgencyRequest extends FormRequest
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
        $file = ['file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'];

        return [
            'company_name' => 'required|string|max:255|unique:agencies,company_name',
            'manager_name' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'activity_zone' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:users,email',
            'id_card' => 'required|string|unique:agencies,id_card',
            'id_card_document' => array_merge(['required'], $file),
            'business_registry_document' => array_merge(['required'], $file),
            'proof_of_address_document' => array_merge(['nullable'], $file),
        ];
    }
}
