<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
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
            'property_id' => 'required|exists:properties,id',
            //'user_id' => 'required|exists:users,id',

            
        ];
    }

    // messages in french

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre est requis.',
            'content.required' => 'Le contenu est requis.',
            'property_id.required' => 'L\'ID de la propriété est requis.',
            'property_id.exists' => 'La propriété spécifiée n\'existe pas.',
            'user_id.required' => 'L\'ID de l\'utilisateur est requis.',
            'user_id.exists' => 'L\'utilisateur spécifié n\'existe pas.',
            'agency_id.required' => 'L\'ID de l\'agence est requis.',
            'agency_id.exists' => 'L\'agence spécifiée n\'existe pas.',
        ];
    }
}