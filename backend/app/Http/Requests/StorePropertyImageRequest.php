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
            'image_path' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
        ];
    }

    // messages in french
    public function messages(): array
    {
        return [

            'image_path.required' => 'Le chemin de l\'image est requis.'
        ];
    }
}
