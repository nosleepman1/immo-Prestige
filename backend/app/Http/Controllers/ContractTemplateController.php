<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractClauseRequest;
use App\Http\Requests\StoreContractTemplateRequest;
use App\Http\Requests\UpdateContractTemplateRequest;
use App\Http\Resources\ContractClauseResource;
use App\Http\Resources\ContractTemplateResource;
use App\Models\Agency;
use App\Models\ContractClause;
use App\Models\ContractTemplate;
use App\Support\ContractVariables;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/**
 * The agency drafts its own lease articles. The platform owns the document's
 * structure and refuses unknown variables; it makes no judgement on the legal
 * content, which the agency writes and re-reads.
 */
class ContractTemplateController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ContractTemplate::class);

        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        return ContractTemplateResource::collection(
            $agency->contractTemplates()->withCount('clauses')->latest()->get()
        );
    }

    public function show(ContractTemplate $template): ContractTemplateResource
    {
        $this->authorize('view', $template);

        return new ContractTemplateResource($template->load('clauses'));
    }

    public function store(StoreContractTemplateRequest $request): JsonResponse
    {
        $this->authorize('create', ContractTemplate::class);

        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        $template = DB::transaction(function () use ($agency, $request) {
            $data = $request->validated();

            // The very first template is the default one whatever was asked:
            // an agency with templates but no default would generate leases
            // carrying no articles at all.
            $isFirst = ! $agency->contractTemplates()->exists();
            $data['is_default'] = $isFirst || ($data['is_default'] ?? false);

            if ($data['is_default']) {
                $this->clearExistingDefault($agency);
            }

            return $agency->contractTemplates()->create($data);
        });

        return ContractTemplateResource::make($template)->response()->setStatusCode(201);
    }

    public function update(UpdateContractTemplateRequest $request, ContractTemplate $template): ContractTemplateResource
    {
        $this->authorize('update', $template);

        DB::transaction(function () use ($request, $template) {
            $data = $request->validated();

            if ($data['is_default'] ?? false) {
                $this->clearExistingDefault($template->agency()->first(), $template->id);
            }

            $template->update($data);
        });

        return new ContractTemplateResource($template->refresh());
    }

    public function destroy(ContractTemplate $template): JsonResponse
    {
        $this->authorize('delete', $template);

        $template->delete();

        return response()->json(null, 204);
    }

    /**
     * The variables an agency may use in its clauses, exposed so the editor can
     * offer them rather than leaving them to be guessed from documentation.
     */
    public function variables(ContractVariables $variables): JsonResponse
    {
        return response()->json(['data' => $variables->available()]);
    }

    public function storeClause(StoreContractClauseRequest $request, ContractTemplate $template): JsonResponse
    {
        $this->authorize('update', $template);

        $data = $request->validated();
        $data['position'] ??= ((int) $template->clauses()->max('position')) + 1;

        $clause = $template->clauses()->create($data);

        return ContractClauseResource::make($clause)->response()->setStatusCode(201);
    }

    public function updateClause(StoreContractClauseRequest $request, ContractClause $clause): ContractClauseResource
    {
        $this->authorize('update', $clause->template()->firstOrFail());

        $clause->update($request->validated());

        return new ContractClauseResource($clause);
    }

    public function destroyClause(ContractClause $clause): JsonResponse
    {
        $this->authorize('update', $clause->template()->firstOrFail());

        $clause->delete();

        return response()->json(null, 204);
    }

    /**
     * Articles are numbered in the printed contract, so their order is part of
     * the document's meaning, not a display preference.
     */
    public function reorderClauses(Request $request, ContractTemplate $template): AnonymousResourceCollection
    {
        $this->authorize('update', $template);

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|distinct',
        ]);

        DB::transaction(function () use ($template, $validated) {
            foreach ($validated['ids'] as $position => $id) {
                $template->clauses()->whereKey($id)->update(['position' => $position]);
            }
        });

        return ContractClauseResource::collection($template->clauses()->get());
    }

    /**
     * Only one default per agency; the database holds the same rule through a
     * partial unique index, so a race cannot leave two behind.
     */
    private function clearExistingDefault(Agency $agency, ?int $except = null): void
    {
        $agency->contractTemplates()
            ->where('is_default', true)
            ->when($except, fn ($q, $id) => $q->whereKeyNot($id))
            ->update(['is_default' => false]);
    }
}
