<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
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
            'price' => 'required|numeric|min:0',
            'region' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'address' => 'required|string|max:255',
            'longitude' => 'nullable|string|max:50',
            'latitude' => 'nullable|string|max:50',
            'sold' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}