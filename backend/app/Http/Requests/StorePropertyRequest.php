<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * agency_id is derived from the authenticated agency; status starts as draft
     * (publication is a guarded action in Lot 6b) — neither is client-supplied.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'property_type_id' => 'required|exists:property_types,id',
            'devise_id' => 'required|exists:devises,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'surface' => 'required|numeric|min:0',
            'rooms' => 'required|integer|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'floor' => 'nullable|integer',
            'furnished' => 'boolean',
            'price' => 'required|numeric|min:0',
            'country' => 'required|string|min:3',
            'region' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
            'sold' => 'boolean',
        ];
    }
}
