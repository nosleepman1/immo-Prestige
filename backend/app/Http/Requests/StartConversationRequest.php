<?php

namespace App\Http\Requests;

use App\Models\Property;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StartConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'agency_id' => ['required', Rule::exists('agencies', 'id')],
            'property_id' => ['nullable', Rule::exists('properties', 'id')],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $propertyId = $this->input('property_id');
            $agencyId = $this->input('agency_id');

            if ($propertyId && $agencyId) {
                $belongs = Property::whereKey($propertyId)->where('agency_id', $agencyId)->exists();

                if (! $belongs) {
                    $validator->errors()->add('property_id', 'Cette propriété n\'appartient pas à l\'agence indiquée.');
                }
            }
        });
    }
}
