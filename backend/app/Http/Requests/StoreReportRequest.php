<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReportRequest extends FormRequest
{
    /**
     * Short public alias -> table, kept in sync with the morph map registered
     * in AppServiceProvider.
     */
    private const REPORTABLE_TABLES = [
        'comment' => 'comments',
        'comment_reply' => 'comment_replies',
        'post' => 'posts',
    ];

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $table = self::REPORTABLE_TABLES[$this->input('reportable_type')] ?? 'comments';

        return [
            'reportable_type' => ['required', Rule::in(array_keys(self::REPORTABLE_TABLES))],
            'reportable_id' => ['required', 'integer', Rule::exists($table, 'id')],
            'reason' => ['required', Rule::in(['spam', 'abusive', 'inappropriate', 'other'])],
            'details' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
