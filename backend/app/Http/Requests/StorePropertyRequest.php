<?php

namespace App\Http\Requests;

use App\Enums\TransactionType;
use App\Models\Agency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * agency_id is derived from the authenticated agency; status starts as draft
     * (publication is a guarded action in Lot 6b) and availability starts as
     * available — none of the three is client-supplied.
     *
     * The `sale` and `rental` blocks are the specialisation: which one is
     * required follows from transaction_type, so a malformed shape is rejected
     * here instead of being discovered by a failing insert.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'property_type_id' => 'required|exists:property_types,id',
            'devise_id' => 'required|exists:devises,id',
            'owner_id' => ['nullable', Rule::exists('owners', 'id')->where('agency_id', $this->agencyId())],
            'transaction_type' => ['required', Rule::enum(TransactionType::class)],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'surface' => 'required|numeric|min:0',
            'rooms' => 'required|integer|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'floor' => 'nullable|integer',
            'furnished' => 'boolean',
            'country' => 'required|string|min:3',
            'region' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',

            'sale' => 'required_if:transaction_type,sale,both|prohibited_if:transaction_type,rent|array',
            'sale.price' => 'required_with:sale|integer|min:1',
            'sale.negotiable' => 'boolean',

            'rental' => 'required_if:transaction_type,rent,both|prohibited_if:transaction_type,sale|array',
            'rental.rent_amount' => 'required_with:rental|integer|min:1',
            'rental.charges_amount' => 'nullable|integer|min:0',
            'rental.deposit_amount' => 'nullable|integer|min:0',
            'rental.advance_months' => 'nullable|integer|min:1|max:12',
            'rental.min_lease_months' => 'nullable|integer|min:1|max:120',
            'rental.available_from' => 'nullable|date',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'sale.required_if' => 'Un bien mis en vente doit porter un prix de vente.',
            'sale.prohibited_if' => 'Un bien uniquement en location ne peut pas porter de prix de vente.',
            'rental.required_if' => 'Un bien mis en location doit porter un loyer.',
            'rental.prohibited_if' => 'Un bien uniquement en vente ne peut pas porter de loyer.',
        ];
    }

    /**
     * Scopes owner_id to the agency's own owners: without it, an agency could
     * attach a competitor's owner by guessing an id.
     */
    private function agencyId(): int
    {
        return (int) Agency::whereBelongsTo($this->user())->value('id');
    }
}
