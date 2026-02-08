<?php

namespace App\Http\Controllers;

use App\Actions\Maintenance\UpdateTicketStatus;
use App\Enums\MaintenanceStatus;
use App\Http\Resources\MaintenanceTicketResource;
use App\Models\Agency;
use App\Models\MaintenanceTicket;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

/**
 * The agency's maintenance queue.
 */
class AgencyMaintenanceController extends Controller
{
    /**
     * Urgent first, then oldest — the ticket that is both urgent and old is the
     * one that will turn into a complaint.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        $tickets = MaintenanceTicket::query()
            ->whereIn('lease_id', $agency->leases()->select('id'))
            ->with(['property', 'reporter'])
            ->withCount('messages')
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('property_id'), fn ($q, $v) => $q->where('property_id', $v))
            ->when($request->boolean('live_only'), fn ($q) => $q->live())
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END")
            ->oldest()
            ->paginate($request->integer('per_page') ?: 20)
            ->withQueryString();

        return MaintenanceTicketResource::collection($tickets);
    }

    public function show(MaintenanceTicket $ticket): MaintenanceTicketResource
    {
        $this->authorize('view', $ticket);

        return new MaintenanceTicketResource(
            $ticket->load(['property', 'reporter', 'images', 'messages.author'])
        );
    }

    public function updateStatus(
        Request $request,
        MaintenanceTicket $ticket,
        UpdateTicketStatus $update,
    ): MaintenanceTicketResource {
        $this->authorize('updateStatus', $ticket);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(MaintenanceStatus::class)],
            // "Résolu" on its own tells the tenant nothing about what was done.
            'resolution_note' => [
                Rule::requiredIf(fn () => in_array($request->input('status'), ['resolved', 'closed'], true)),
                'nullable', 'string', 'max:2000',
            ],
        ], [
            'resolution_note.required' => 'Dites ce qui a été fait : « résolu » seul ne renseigne pas le locataire.',
        ]);

        return new MaintenanceTicketResource($update->handle(
            $ticket,
            MaintenanceStatus::from($validated['status']),
            $validated['resolution_note'] ?? null,
        ));
    }
}
