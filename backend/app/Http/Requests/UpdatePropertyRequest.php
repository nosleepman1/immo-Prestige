<?php

namespace App\Http\Requests;

use App\Enums\PropertyAvailability;
use App\Enums\TransactionType;
use App\Models\Agency;
use App\Models\Property;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
     * `availability` is settable here: it is the successor of the former `sold`
     * boolean, which the agency also set by hand. Lot 13 will constrain the
     * transitions once leases exist.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'property_type_id' => 'sometimes|required|exists:property_types,id',
            'devise_id' => 'sometimes|required|exists:devises,id',
            'owner_id' => ['nullable', Rule::exists('owners', 'id')->where('agency_id', $this->agencyId())],
            'transaction_type' => ['sometimes', 'required', Rule::enum(TransactionType::class)],
            'availability' => ['sometimes', 'required', Rule::enum(PropertyAvailability::class)],
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'surface' => 'sometimes|required|numeric|min:0',
            'rooms' => 'sometimes|required|integer|min:0',
            'bedrooms' => 'sometimes|required|integer|min:0',
            'floor' => 'nullable|integer',
            'furnished' => 'boolean',
            'country' => 'sometimes|required|string|min:3',
            'region' => 'sometimes|required|string|max:100',
            'city' => 'sometimes|required|string|max:100',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',

            'sale' => 'sometimes|array',
            'sale.price' => 'sometimes|required|integer|min:1',
            'sale.negotiable' => 'boolean',

            'rental' => 'sometimes|array',
            'rental.rent_amount' => 'sometimes|required|integer|min:1',
            'rental.charges_amount' => 'nullable|integer|min:0',
            'rental.deposit_amount' => 'nullable|integer|min:0',
            'rental.advance_months' => 'nullable|integer|min:1|max:12',
            'rental.min_lease_months' => 'nullable|integer|min:1|max:120',
            'rental.available_from' => 'nullable|date',
        ];
    }

    /**
     * Switching a listing from sale to rental (or the reverse) needs the terms
     * of the side being opened. Refusing here keeps the invariant "a listing
     * always carries the details its transaction type implies".
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $type = $this->enum('transaction_type', TransactionType::class);

            if ($type === null) {
                return;
            }

            /** @var Property|null $property */
            $property = $this->route('property');

            if ($type->requiresSaleDetails() && ! $this->filled('sale') && ! $property?->saleDetail()->exists()) {
                $validator->errors()->add('sale', 'Un bien mis en vente doit porter un prix de vente.');
            }

            if ($type->requiresRentalDetails() && ! $this->filled('rental') && ! $property?->rentalDetail()->exists()) {
                $validator->errors()->add('rental', 'Un bien mis en location doit porter un loyer.');
            }
        });
    }

    private function agencyId(): int
    {
        return (int) Agency::whereBelongsTo($this->user())->value('id');
    }
}
