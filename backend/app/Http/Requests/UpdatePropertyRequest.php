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
     * All fields optional (partial update). agency_id and status are never
     * client-supplied — ownership is derived, publication is a guarded action.
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
            'rooms' => 'sometimes|required|integer|min:0',
            'bedrooms' => 'sometimes|required|integer|min:0',
            'floor' => 'nullable|integer',
            'furnished' => 'boolean',
            'price' => 'sometimes|required|numeric|min:0',
            'country' => 'sometimes|required|string|min:3',
            'region' => 'sometimes|required|string|max:100',
            'city' => 'sometimes|required|string|max:100',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
            'sold' => 'boolean',
        ];
    }
}
