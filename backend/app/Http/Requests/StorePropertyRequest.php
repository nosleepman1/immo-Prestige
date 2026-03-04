<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
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
            'property_type_id' => 'required|exists:property_types,id',
            'agency_id' => 'required|exists:agencies,id',
            'devise_id' => 'required|exists:devises,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'surface' => 'required|numeric|min:0',
            'rooms' => 'required|numeric|min:0',
            'bedrooms' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'country' => 'required|string|min:3',
            'region' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'longitude' => 'nullable|string|max:50',
            'latitude' => 'nullable|string|max:50',
            'sold' => 'boolean',
            'is_active' => 'boolean'
        ];
    }

    public function messages()
    {
        // french messages
        return [
            'property_type_id.required' => 'Le type de propriété est obligatoire.',
            'agency_id.required' => 'L\'agence est obligatoire.',
            'devise_id.required' => 'La devise est obligatoire.',
            'name.required' => 'Le nom est obligatoire.',
            'name.string' => 'Le nom doit être une chaîne de caractères.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'surface.required' => 'La surface est obligatoire.',
            'surface.numeric' => 'La surface doit être un nombre.',
            'surface.min' => 'La surface doit être supérieure à 0.',
            'price.required' => 'Le prix est obligatoire.',
            'price.numeric' => 'Le prix doit être un nombre.',
            'price.min' => 'Le prix doit être supérieure à 0.',
            'region.required' => 'La région est obligatoire.',
            'region.string' => 'La région doit être une chaîne de caractères.',
            'region.max' => 'La région ne doit pas dépasser 100 caractères.',
            'city.required' => 'La ville est obligatoire.',
            'city.string' => 'La ville doit être une chaîne de caractères.',
            'city.max' => 'La ville ne doit pas dépasser 100 caractères.',
            'longitude.max' => 'La longitude ne doit pas dépasser 50 caractères.',
            'latitude.max' => 'La latitude ne doit pas dépasser 50 caractères.',
            'sold.boolean' => 'Le statut de vente doit être un booléen.',
            'is_active.boolean' => 'Le statut actif doit être un booléen.'
            
        ];  
    }
}