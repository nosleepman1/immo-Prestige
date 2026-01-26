<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoginRequest extends FormRequest
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
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string',
        ];
    }

    // messages in french
    
    public function messages(): array
    {
        return [
            'email.required' => 'L\'email est requis.',
            'email.email' => 'Le format de l\'email est invalide.',
            'email.exists' => 'L\'email spécifié n\'existe pas.',
            'password.required' => 'Le mot de passe est requis.',
        ];
    }
}