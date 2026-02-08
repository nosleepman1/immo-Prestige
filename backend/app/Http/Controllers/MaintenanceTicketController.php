<?php

namespace App\Http\Controllers;

use App\Actions\Maintenance\OpenMaintenanceTicket;
use App\Actions\Maintenance\PostTicketMessage;
use App\Enums\MaintenanceCategory;
use App\Enums\MaintenancePriority;
use App\Http\Resources\MaintenanceTicketMessageResource;
use App\Http\Resources\MaintenanceTicketResource;
use App\Models\Lease;
use App\Models\MaintenanceTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * The tenant's side: report a problem, follow it, discuss it.
 */
class MaintenanceTicketController extends Controller
{
    public function index(Lease $lease): AnonymousResourceCollection
    {
        $this->authorize('view', $lease);

        return MaintenanceTicketResource::collection(
            $lease->maintenanceTickets()->with('property')->withCount('messages')->latest()->get()
        );
    }

    public function show(Request $request, MaintenanceTicket $ticket): MaintenanceTicketResource
    {
        $this->authorize('view', $ticket);

        return new MaintenanceTicketResource(
            $ticket->load(['property', 'reporter', 'images', 'messages.author'])
        );
    }

    /**
     * RG-L21: enforced by the policy — only the lease's tenant opens a ticket
     * on that lease.
     */
    public function store(Request $request, Lease $lease, OpenMaintenanceTicket $open): JsonResponse
    {
        abort_unless((int) $lease->tenant_user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'category' => ['required', Rule::enum(MaintenanceCategory::class)],
            'priority' => ['nullable', Rule::enum(MaintenancePriority::class)],
        ]);

        $ticket = $open->handle($lease, $request->user(), $validated);

        return MaintenanceTicketResource::make($ticket->load('property'))
            ->response()
            ->setStatusCode(201);
    }

    public function storeMessage(
        Request $request,
        MaintenanceTicket $ticket,
        PostTicketMessage $post,
    ): JsonResponse {
        $this->authorize('comment', $ticket);

        $validated = $request->validate(['body' => 'required|string|max:5000']);

        $message = $post->handle($ticket, $request->user(), $validated['body']);

        return MaintenanceTicketMessageResource::make($message->load('author'))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * A photo is what turns "il y a une fuite" into something an agency can
     * act on without a site visit.
     */
    public function storeImage(Request $request, MaintenanceTicket $ticket): JsonResponse
    {
        $this->authorize('attachImage', $ticket);

        $request->validate(['image' => 'required|image|mimes:jpg,jpeg,png|max:5120']);

        $image = $ticket->images()->create([
            'image_path' => $request->file('image')->store("maintenance/{$ticket->id}", 'public'),
            'position' => (int) $ticket->images()->max('position') + 1,
        ]);

        return response()->json(['data' => ['id' => $image->id, 'url' => Storage::disk('public')->url($image->image_path)]], 201);
    }
}
