<?php

namespace Tests\Feature\Account;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnonymizeDeletedAccountsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_anonymizes_accounts_deleted_more_than_30_days_ago(): void
    {
        $old = User::factory()->create(['name' => 'Awa Ndiaye', 'email' => 'awa@example.com']);
        $old->delete();
        $old->forceFill(['deleted_at' => now()->subDays(31)])->save();

        $this->artisan('accounts:anonymize')->assertSuccessful();

        $fresh = User::onlyTrashed()->find($old->id);
        $this->assertSame('Compte supprimé', $fresh->name);
        $this->assertSame("deleted-{$old->id}@anonymized.invalid", $fresh->email);
    }

    public function test_it_leaves_recently_deleted_accounts_untouched(): void
    {
        $recent = User::factory()->create(['name' => 'Moussa Fall']);
        $recent->delete();

        $this->artisan('accounts:anonymize');

        $fresh = User::onlyTrashed()->find($recent->id);
        $this->assertSame('Moussa Fall', $fresh->name);
    }

    public function test_it_never_touches_an_active_account(): void
    {
        $active = User::factory()->create(['name' => 'Fatou Diop']);

        $this->artisan('accounts:anonymize');

        $this->assertSame('Fatou Diop', $active->fresh()->name);
    }
}
