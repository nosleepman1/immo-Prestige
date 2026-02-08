<?php

namespace Tests\Feature\Messaging;

use App\Models\Agency;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationListTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_client_lists_their_own_conversations_with_unread_counts(): void
    {
        $client = User::factory()->create();
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $conversation = Conversation::factory()->create(['client_id' => $client->id, 'agency_id' => $agency->id]);
        Message::factory()->count(2)->create(['conversation_id' => $conversation->id, 'sender_id' => $agencyUser->id]);
        Conversation::factory()->create(); // unrelated, must not appear

        $this->actingAs($client, 'sanctum')
            ->getJson('/api/v1/conversations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.unread_count', 2);
    }

    public function test_an_agency_lists_conversations_addressed_to_it(): void
    {
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        Conversation::factory()->create(['agency_id' => $agency->id]);
        Conversation::factory()->create(); // another agency

        $this->actingAs($agencyUser, 'sanctum')
            ->getJson('/api/v1/conversations')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_a_guest_cannot_list_conversations(): void
    {
        $this->getJson('/api/v1/conversations')->assertStatus(401);
    }

    public function test_messages_are_paginated_newest_first(): void
    {
        $client = User::factory()->create();
        $agency = Agency::factory()->create();
        $conversation = Conversation::factory()->create(['client_id' => $client->id, 'agency_id' => $agency->id]);
        $older = Message::factory()->create(['conversation_id' => $conversation->id, 'created_at' => now()->subMinute()]);
        $newer = Message::factory()->create(['conversation_id' => $conversation->id, 'created_at' => now()]);

        $this->actingAs($client, 'sanctum')
            ->getJson("/api/v1/conversations/{$conversation->id}/messages")
            ->assertOk()
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id);
    }

    public function test_a_third_party_cannot_read_messages(): void
    {
        $conversation = Conversation::factory()->create();
        $intruder = User::factory()->create();

        $this->actingAs($intruder, 'sanctum')
            ->getJson("/api/v1/conversations/{$conversation->id}/messages")
            ->assertStatus(403);
    }
}
