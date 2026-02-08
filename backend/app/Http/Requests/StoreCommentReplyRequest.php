<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth ;

class StoreCommentReplyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check(); // Only allow authenticated users to create comment replies
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => 'required|string',
            //'comment_id' => 'required|exists:comments,id',
            //'user_id' => 'required|exists:users,id',
        ];
    }


    // messages in french
    public function messages(): array
    {
        return [
            'content.required' => 'Le contenu est requis.',
            'comment_id.required' => 'L\'ID du commentaire est requis.',
            'comment_id.exists' => 'Le commentaire spécifié n\'existe pas.',
            'user_id.required' => 'L\'ID de l\'utilisateur est requis.',
            'user_id.exists' => 'L\'utilisateur spécifié n\'existe pas.',
        ];
    }
}