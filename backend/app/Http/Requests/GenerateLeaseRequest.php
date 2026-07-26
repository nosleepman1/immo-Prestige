<?php

namespace App\Http\Requests;

use App\Enums\LeasePeriodicity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Everything here is optional: left blank, the lease takes the terms the
 * candidate asked for and the agency's defaults. The amounts are never
 * client-supplied — they are copied from the listing (RG-L09).
 */
class GenerateLeaseRequest extends FormRequest
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
            'contract_template_id' => 'nullable|exists:contract_templates,id',
            'start_date' => 'nullable|date',
            'duration_months' => 'nullable|integer|min:1|max:120',
            'periodicity' => ['nullable', Rule::enum(LeasePeriodicity::class)],
            // Capped at 28 so a payment day exists in February too.
            'payment_day' => 'nullable|integer|min:1|max:28',
            'notice_period_days' => 'nullable|integer|min:0|max:365',
        ];
    }
}
