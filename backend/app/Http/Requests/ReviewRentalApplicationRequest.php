<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Shared by the three review endpoints. The rule that matters is RG-L07: a
 * refusal without a reason is refused — the candidate is owed an explanation,
 * and the rejection e-mail quotes this very field.
 */
class ReviewRentalApplicationRequest extends FormRequest
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
            'rejection_reason' => [$this->routeIs('*reject') ? 'required' : 'prohibited', 'string', 'max:2000'],
            'requested_documents' => [
                $this->routeIs('*request-documents') ? 'required' : 'prohibited',
                'string', 'max:2000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rejection_reason.required' => 'Un refus doit être motivé.',
            'requested_documents.required' => 'Précisez les pièces demandées au candidat.',
        ];
    }
}
