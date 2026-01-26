<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLikeRequest extends FormRequest
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
            'post_id' => 'required|integer|exists:posts,id',
            'user_id' => 'required|integer|exists:users,id',
        ];
    }

    // messages in french
    
    public function messages(): array
    {
        return [
            'post_id.required' => 'L\'ID du post est requis.',
            'post_id.integer' => 'L\'ID du post doit être un entier.',
            'post_id.exists' => 'Le post spécifié n\'existe pas.',
            'user_id.required' => 'L\'ID de l\'utilisateur est requis.',
            'user_id.integer' => 'L\'ID de l\'utilisateur doit être un entier.',
            'user_id.exists' => 'L\'utilisateur spécifié n\'existe pas.',
        ];
    }
}