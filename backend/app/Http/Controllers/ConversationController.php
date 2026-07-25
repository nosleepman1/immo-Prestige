<?php

namespace App\Http\Controllers;

use App\Actions\Messaging\MarkConversationRead;
use App\Actions\Messaging\SendMessage;
use App\Actions\Messaging\StartConversation;
use App\Http\Requests\SendMessageRequest;
use App\Http\Requests\StartConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Agency;
use App\Models\Conversation;
use App\Models\Property;
use App\Queries\ConversationListQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ConversationController extends Controller
{
    public function index(Request $request, ConversationListQuery $query): AnonymousResourceCollection
    {
        return ConversationResource::collection($query->handle($request->user()));
    }

    public function store(StartConversationRequest $request, StartConversation $startConversation): JsonResponse
    {
        $this->authorize('create', Conversation::class);

        $data = $request->validated();
        $agency = Agency::findOrFail($data['agency_id']);
        $property = isset($data['property_id']) ? Property::find($data['property_id']) : null;

        $conversation = $startConversation->handle($request->user(), $agency, $property);

        return ConversationResource::make($conversation->load(['property', 'client', 'agency']))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Reverse-chronological pagination: newest messages first, paginating
     * backward through history.
     */
    public function messages(Conversation $conversation): AnonymousResourceCollection
    {
        $this->authorize('view', $conversation);

        return MessageResource::collection(
            $conversation->messages()->with('sender')->latest()->paginate(30)
        );
    }

    public function sendMessage(SendMessageRequest $request, Conversation $conversation, SendMessage $sendMessage): JsonResponse
    {
        $this->authorize('view', $conversation);

        $message = $sendMessage->handle($conversation, $request->user(), $request->validated()['content']);

        return MessageResource::make($message->load('sender'))->response()->setStatusCode(201);
    }

    public function markRead(Request $request, Conversation $conversation, MarkConversationRead $markRead): JsonResponse
    {
        $this->authorize('view', $conversation);

        $marked = $markRead->handle($conversation, $request->user());

        return response()->json(['data' => ['marked' => $marked]]);
    }
}
