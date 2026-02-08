<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check(); // Only allow authenticated users to send messages
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'receiver_id' => 'required|integer|exists:users,id',
            'content' => 'required|string|max:10000',
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_id.required' => 'L\'ID du destinataire est requis.',
            'receiver_id.integer' => 'L\'ID du destinataire doit être un entier.',
            'receiver_id.exists' => 'Le destinataire spécifié n\'existe pas.',
            'content.required' => 'Le contenu du message est requis.',
            'content.string' => 'Le contenu du message doit être une chaîne de caractères.',
            'content.max' => 'Le contenu du message ne peut pas dépasser 1000 caractères.',
        ];
    }
}
