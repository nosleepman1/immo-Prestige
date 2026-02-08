<?php

namespace App\Http\Requests;

use App\Support\ContractVariables;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreContractClauseRequest extends FormRequest
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
            'title' => ($this->isMethod('post') ? 'required' : 'sometimes|required').'|string|max:255',
            'body' => ($this->isMethod('post') ? 'required' : 'sometimes|required').'|string|max:20000',
            'position' => 'nullable|integer|min:0',
            'is_required' => 'boolean',
        ];
    }

    /**
     * A typo in a variable is caught while the agency is still editing the
     * clause, not months later when a real contract fails to generate.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $variables = app(ContractVariables::class);

            foreach (['title', 'body'] as $field) {
                if (! $this->filled($field)) {
                    continue;
                }

                $unknown = $variables->unknownVariablesIn((string) $this->input($field));

                if ($unknown !== []) {
                    $validator->errors()->add($field, sprintf(
                        'Variable inconnue : %s. Variables disponibles : %s.',
                        implode(', ', array_map(fn ($v) => '{{'.$v.'}}', $unknown)),
                        implode(', ', array_map(fn ($v) => '{{'.$v.'}}', $variables->available())),
                    ));
                }
            }
        });
    }
}
