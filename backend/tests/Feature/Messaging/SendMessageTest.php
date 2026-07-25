<?php

namespace Tests\Feature\Messaging;

use App\Events\MessageSent;
use App\Jobs\NotifyOfflineRecipient;
use App\Models\Agency;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SendMessageTest extends TestCase
{
    use RefreshDatabase;

    private function conversationWithParties(): array
    {
        $client = User::factory()->create();
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $conversation = Conversation::factory()->create(['client_id' => $client->id, 'agency_id' => $agency->id]);

        return [$client, $agencyUser, $conversation];
    }

    public function test_the_client_can_send_a_message_and_it_broadcasts(): void
    {
        Event::fake([MessageSent::class]);
        [$client, , $conversation] = $this->conversationWithParties();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", ['content' => 'Bonjour !'])
            ->assertCreated()
            ->assertJsonPath('data.content', 'Bonjour !');

        $this->assertDatabaseHas('messages', ['conversation_id' => $conversation->id, 'sender_id' => $client->id]);
        $this->assertDatabaseHas('conversations', ['id' => $conversation->id]);
        Event::assertDispatched(MessageSent::class);
    }

    public function test_the_agency_can_reply(): void
    {
        [, $agencyUser, $conversation] = $this->conversationWithParties();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", ['content' => 'Bien reçu.'])
            ->assertCreated();

        $this->assertDatabaseHas('messages', ['conversation_id' => $conversation->id, 'sender_id' => $agencyUser->id]);
    }

    public function test_a_third_party_cannot_send_a_message(): void
    {
        [, , $conversation] = $this->conversationWithParties();
        $intruder = User::factory()->create();

        $this->actingAs($intruder, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", ['content' => 'x'])
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_send_a_message(): void
    {
        [, , $conversation] = $this->conversationWithParties();

        $this->postJson("/api/v1/conversations/{$conversation->id}/messages", ['content' => 'x'])->assertStatus(401);
    }

    public function test_sending_validates_the_payload(): void
    {
        [$client, , $conversation] = $this->conversationWithParties();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", ['content' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_sending_to_a_missing_conversation_returns_404(): void
    {
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/conversations/999999/messages', ['content' => 'x'])
            ->assertStatus(404);
    }

    public function test_a_message_burst_schedules_a_single_grouped_notification_job(): void
    {
        Queue::fake();
        [$client, , $conversation] = $this->conversationWithParties();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", ['content' => 'un'])
            ->assertCreated();
        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", ['content' => 'deux'])
            ->assertCreated();

        Queue::assertPushed(NotifyOfflineRecipient::class, 1);
    }
}
