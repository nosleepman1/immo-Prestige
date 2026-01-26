<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyTypeRequest extends FormRequest
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
            'name' => 'required|string|max:255|unique:property_types,name',
        ];
    }

    public function messages(): array
    {
        return [
           // in french
              'name.required' => 'Le nom du type de propriété est obligatoire.',
              'name.string' => 'Le nom du type de propriété doit être une chaîne de caractères.',
              'name.max' => 'Le nom du type de propriété ne doit pas dépasser 255 caractères.',
              'name.unique' => 'Un type de propriété avec ce nom existe déjà.'
        ];
    }
}