<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyImageRequest extends FormRequest
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
            'image_path' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
        ];
    }

    // messages in french
    public function messages(): array
    {
        return [
            'property_id.required' => 'L\'ID de la propriété est requis.',
            'property_id.exists' => 'La propriété spécifiée n\'existe pas.',
            'image_path.required' => 'Le chemin de l\'image est requis.',
            'is_cover.required' => 'Le statut de l\'image de couverture est requis.',
            'is_cover.boolean' => 'Le statut de l\'image de couverture doit être vrai ou faux.',
        ];
    }
}
