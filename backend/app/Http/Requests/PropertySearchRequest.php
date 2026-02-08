<?php

namespace App\Http\Requests;

use App\Enums\PropertyAvailability;
use App\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PropertySearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * `price_min` / `price_max` are read against the sale price or the monthly
     * rent depending on `transaction_type` — see PropertySearchQuery.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'country' => 'nullable|string|max:100',
            'region' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'property_type_id' => 'nullable|exists:property_types,id',
            'transaction_type' => ['nullable', Rule::enum(TransactionType::class)],
            'availability' => ['nullable', Rule::enum(PropertyAvailability::class)],
            'price_min' => 'nullable|integer|min:0',
            // A reversed range would silently return nothing, which reads as
            // "no results" rather than "bad filter" — but only compare the two
            // bounds when both were actually supplied.
            'price_max' => ['nullable', 'integer', 'min:0', Rule::when($this->filled('price_min'), ['gte:price_min'])],
            'rooms' => 'nullable|integer|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'furnished' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:50',
        ];
    }
}
