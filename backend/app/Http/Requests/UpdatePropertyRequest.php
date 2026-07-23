<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * All fields optional (partial update). agency_id is never client-supplied
     * — ownership is derived from the authenticated agency.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'property_type_id' => 'sometimes|required|exists:property_types,id',
            'devise_id' => 'sometimes|required|exists:devises,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'surface' => 'sometimes|required|numeric|min:0',
            'rooms' => 'sometimes|required|numeric|min:0',
            'bedrooms' => 'sometimes|required|numeric|min:0',
            'floor' => 'nullable|integer',
            'furnished' => 'boolean',
            'price' => 'sometimes|required|numeric|min:0',
            'country' => 'sometimes|required|string|min:3',
            'region' => 'sometimes|required|string|max:100',
            'city' => 'sometimes|required|string|max:100',
            'longitude' => 'nullable|string|max:50',
            'latitude' => 'nullable|string|max:50',
            'sold' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
