<?php

namespace Tests\Feature\Messaging;

use App\Events\MessagesRead;
use App\Models\Agency;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class MarkReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_recipient_can_mark_messages_as_read(): void
    {
        Event::fake([MessagesRead::class]);
        $client = User::factory()->create();
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $conversation = Conversation::factory()->create(['client_id' => $client->id, 'agency_id' => $agency->id]);
        $message = Message::factory()->create(['conversation_id' => $conversation->id, 'sender_id' => $agencyUser->id]);

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/read")
            ->assertOk()
            ->assertJsonPath('data.marked', 1);

        $this->assertNotNull($message->fresh()->read_at);
        Event::assertDispatched(MessagesRead::class);
    }

    public function test_marking_read_never_marks_ones_own_messages(): void
    {
        $client = User::factory()->create();
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $conversation = Conversation::factory()->create(['client_id' => $client->id, 'agency_id' => $agency->id]);
        $ownMessage = Message::factory()->create(['conversation_id' => $conversation->id, 'sender_id' => $client->id]);

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/read")
            ->assertJsonPath('data.marked', 0);

        $this->assertNull($ownMessage->fresh()->read_at);
    }

    public function test_a_third_party_cannot_mark_a_conversation_read(): void
    {
        $conversation = Conversation::factory()->create();
        $intruder = User::factory()->create();

        $this->actingAs($intruder, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/read")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_mark_read(): void
    {
        $conversation = Conversation::factory()->create();

        $this->postJson("/api/v1/conversations/{$conversation->id}/read")->assertStatus(401);
    }

    public function test_marking_a_missing_conversation_read_returns_404(): void
    {
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/conversations/999999/read')
            ->assertStatus(404);
    }
}
