<?php

namespace App\Queries;

use App\Enums\InstallmentStatus;
use App\Enums\LeaseStatus;
use App\Enums\MaintenanceStatus;
use App\Enums\PropertyAvailability;
use App\Enums\RentalApplicationStatus;
use App\Models\Agency;
use App\Models\LeaseInstallment;
use App\Models\MaintenanceTicket;
use App\Models\Property;
use App\Models\RentalApplication;
use Illuminate\Support\Facades\DB;

/**
 * The operational figures an agency looks at every morning: what is owed, what
 * is late, what is empty, what is waiting for them.
 *
 * Deliberately separate from the general stats endpoint, which answers "how is
 * the business doing" over six months. This one answers "what do I do today",
 * and every figure is one grouped query rather than a loop over months — the
 * arrears panel is read on every page load.
 */
class AgencyRentalDashboardQuery
{
    /**
     * @return array<string, mixed>
     */
    public function handle(Agency $agency): array
    {
        $leaseIds = $agency->leases()->select('id');

        return [
            'leases' => $this->leases($agency),
            'installments' => $this->installments($leaseIds),
            'applications' => $this->applications($agency),
            'occupancy' => $this->occupancy($agency),
            'tickets' => $this->tickets($leaseIds),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function leases(Agency $agency): array
    {
        $byStatus = $agency->leases()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'active' => (int) ($byStatus[LeaseStatus::Active->value] ?? 0),
            'pending_signature' => (int) ($byStatus[LeaseStatus::PendingSignature->value] ?? 0),
            'pending_payment' => (int) ($byStatus[LeaseStatus::PendingPayment->value] ?? 0),
            'pending_validation' => (int) ($byStatus[LeaseStatus::PendingValidation->value] ?? 0),
            'expired' => (int) ($byStatus[LeaseStatus::Expired->value] ?? 0),
            'terminated' => (int) ($byStatus[LeaseStatus::Terminated->value] ?? 0),
        ];
    }

    /**
     * Money, in one pass: what is still owed overall, what of it is late, and
     * what was actually collected this month.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<\App\Models\Lease>  $leaseIds
     * @return array<string, int>
     */
    private function installments($leaseIds): array
    {
        $outstanding = LeaseInstallment::whereIn('lease_id', $leaseIds)
            ->outstanding()
            ->selectRaw('sum(total_amount - paid_amount) as due, count(*) as count')
            ->first();

        $late = LeaseInstallment::whereIn('lease_id', $leaseIds)
            ->where('status', InstallmentStatus::Late->value)
            ->selectRaw('sum(total_amount - paid_amount) as due, count(*) as count')
            ->first();

        $collected = (int) LeaseInstallment::whereIn('lease_id', $leaseIds)
            ->whereYear('paid_at', now()->year)
            ->whereMonth('paid_at', now()->month)
            ->sum('paid_amount');

        // Due within the week: what a reminder call would still prevent.
        $dueSoon = LeaseInstallment::whereIn('lease_id', $leaseIds)
            ->outstanding()
            ->whereBetween('due_date', [today(), today()->addWeek()])
            ->count();

        return [
            'outstanding_amount' => (int) ($outstanding->due ?? 0),
            'outstanding_count' => (int) ($outstanding->count ?? 0),
            'late_amount' => (int) ($late->due ?? 0),
            'late_count' => (int) ($late->count ?? 0),
            'collected_this_month' => $collected,
            'due_within_a_week' => $dueSoon,
        ];
    }

    /**
     * @return array<string, int>
     */
    private function applications(Agency $agency): array
    {
        $byStatus = RentalApplication::where('agency_id', $agency->id)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'awaiting_review' => (int) ($byStatus[RentalApplicationStatus::Submitted->value] ?? 0)
                + (int) ($byStatus[RentalApplicationStatus::UnderReview->value] ?? 0),
            'documents_requested' => (int) ($byStatus[RentalApplicationStatus::DocumentsRequested->value] ?? 0),
            'accepted' => (int) ($byStatus[RentalApplicationStatus::Accepted->value] ?? 0),
        ];
    }

    /**
     * Rented against vacant, over the rental stock only — counting sale-only
     * listings as "vacant" would make every agency look half-empty.
     *
     * @return array<string, int|float>
     */
    private function occupancy(Agency $agency): array
    {
        $rentable = Property::where('agency_id', $agency->id)
            ->whereIn('transaction_type', ['rent', 'both'])
            ->select('availability', DB::raw('count(*) as total'))
            ->groupBy('availability')
            ->pluck('total', 'availability');

        $rented = (int) ($rentable[PropertyAvailability::Rented->value] ?? 0);
        $total = (int) $rentable->sum();

        return [
            'rented' => $rented,
            'available' => (int) ($rentable[PropertyAvailability::Available->value] ?? 0),
            'reserved' => (int) ($rentable[PropertyAvailability::Reserved->value] ?? 0),
            'total' => $total,
            'rate' => $total > 0 ? round(($rented / $total) * 100, 1) : 0.0,
        ];
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<\App\Models\Lease>  $leaseIds
     * @return array<string, int>
     */
    private function tickets($leaseIds): array
    {
        $live = MaintenanceTicket::whereIn('lease_id', $leaseIds)->live();

        return [
            'open' => (int) (clone $live)->count(),
            'urgent' => (int) (clone $live)->where('priority', 'urgent')->count(),
            'unacknowledged' => (int) (clone $live)
                ->where('status', MaintenanceStatus::Open->value)
                ->count(),
        ];
    }
}
