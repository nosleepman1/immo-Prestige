<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * GDPR: soft-deleted accounts are anonymized (not hard-deleted, so referential
 * integrity on properties/messages/comments is preserved) once the 30-day
 * grace period — during which a user could still contest the deletion — has
 * passed. Idempotent: already-anonymized rows are excluded by the name marker.
 */
class AnonymizeDeletedAccounts extends Command
{
    protected $signature = 'accounts:anonymize';

    protected $description = 'Anonymize personal data on accounts soft-deleted more than 30 days ago';

    private const GRACE_DAYS = 30;

    private const ANONYMIZED_NAME = 'Compte supprimé';

    public function handle(): int
    {
        $accounts = User::onlyTrashed()
            ->where('deleted_at', '<', now()->subDays(self::GRACE_DAYS))
            ->where('name', '!=', self::ANONYMIZED_NAME)
            ->get();

        foreach ($accounts as $user) {
            $user->forceFill([
                'name' => self::ANONYMIZED_NAME,
                'email' => "deleted-{$user->id}@anonymized.invalid",
            ])->save();
        }

        $this->info(count($accounts).' account(s) anonymized.');

        return self::SUCCESS;
    }
}
