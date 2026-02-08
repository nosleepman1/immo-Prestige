<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\AgencyDocument;
use App\Models\Comment;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Report;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Populates the domains added after the initial DatabaseSeeder (admin role,
 * agency onboarding, subscriptions, messaging, moderation) so the admin
 * dashboard and messaging screens have something to show in a demo.
 *
 * Not part of the default `db:seed` run — invoke explicitly:
 *   php artisan db:seed --class=DemoDataSeeder
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@immo-prestige.test'],
            ['name' => 'Admin', 'password' => Hash::make('passer123'), 'role' => 'admin']
        );
        $this->command->info("Admin: {$admin->email} / passer123");

        $this->seedPendingAgency();
        $this->seedTrialSubscription();
        $this->seedConversation();
        $this->seedReports();

        $this->command->info('Demo data seeded.');
    }

    private function seedPendingAgency(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'nouvelle-agence@example.com'],
            ['name' => 'Demandeur', 'password' => null, 'role' => 'agency']
        );

        $agency = Agency::firstOrCreate(
            ['user_id' => $user->id],
            [
                'company_name' => 'Nouvelle Agence Demo',
                'manager_name' => 'Ibrahima Ndoye',
                'description' => 'Agence en attente de validation pour la démo du dashboard admin.',
                'address' => 'Rue 12, Point E',
                'city' => 'Dakar',
                'activity_zone' => 'Dakar',
                'phone' => '+221771234567',
                'id_card' => 'DEMO-PENDING-0001',
                'status' => 'pending',
            ]
        );

        foreach (['id_card', 'business_registry'] as $type) {
            AgencyDocument::firstOrCreate([
                'agency_id' => $agency->id,
                'type' => $type,
            ], [
                'path' => "agency_documents/demo-{$type}.pdf",
                'original_name' => "{$type}.pdf",
            ]);
        }
    }

    private function seedTrialSubscription(): void
    {
        $agency = Agency::where('company_name', '!=', 'Nouvelle Agence Demo')->first();

        if (! $agency) {
            return;
        }

        Subscription::firstOrCreate(
            ['agency_id' => $agency->id],
            ['status' => 'trialing', 'trial_ends_at' => now()->addDays(30)]
        );
    }

    private function seedConversation(): void
    {
        $client = User::where('role', 'user')->first();
        $agency = Agency::where('company_name', '!=', 'Nouvelle Agence Demo')->first();

        if (! $client || ! $agency) {
            return;
        }

        $conversation = Conversation::firstOrCreate([
            'client_id' => $client->id,
            'agency_id' => $agency->id,
            'property_id' => $agency->properties()->first()?->id,
        ]);

        if ($conversation->messages()->count() === 0) {
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $client->id,
                'content' => 'Bonjour, ce bien est-il toujours disponible ?',
            ]);

            $agencyUserId = $agency->user()->value('id');
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $agencyUserId,
                'content' => 'Bonjour, oui il est toujours disponible !',
                'read_at' => now(),
            ]);

            $conversation->update(['last_message_at' => now()]);
        }
    }

    private function seedReports(): void
    {
        $comment = Comment::first();
        $reporter = User::where('role', 'user')->skip(1)->first();

        if (! $comment || ! $reporter) {
            return;
        }

        Report::firstOrCreate([
            'reporter_id' => $reporter->id,
            'reportable_type' => 'comment',
            'reportable_id' => $comment->id,
        ], [
            'reason' => 'spam',
            'details' => 'Contenu publicitaire (démo).',
            'status' => 'pending',
        ]);
    }
}
