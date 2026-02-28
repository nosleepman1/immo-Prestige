<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgencyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => 'required|string|max:255|unique:agencies,company_name',
            'description' => 'required|string',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'id_card' => 'required|string|unique:agencies,id_card',
            'user_id' => 'exists:users,id',
        ];
    }

    // messages in french
    public function messages(): array
    {
        return [
            'company_name.required' => 'Le nom de l\'entreprise est requis.',
            'company_name.string' => 'Le nom de l\'entreprise doit être une chaîne de caractères.',
            'company_name.max' => 'Le nom de l\'entreprise ne doit pas dépasser 255 caractères.',
            'company_name.unique' => 'Une entreprise avec ce nom existe déjà.',
            'description.required' => 'La description est requise.',
            'address.required' => 'L\'adresse est requise.',
            'city.required' => 'La ville est requise.',
            'phone.required' => 'Le numéro de téléphone est requis.',
            'id_card.required' => 'La carte d\'identité est requise.',
            'id_card.unique' => 'La carte d\'identité spécifiée existe déjà.',
            'user_id.exists' => 'L\'utilisateur spécifié n\'existe pas.',
        ];
    }
}
