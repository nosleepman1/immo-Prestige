<?php

namespace App\Queries;

use App\Enums\TransactionType;
use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * Public, paginated property search over published listings. Eager-loads the
 * relations the resource renders to avoid N+1.
 */
class PropertySearchQuery
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function handle(array $filters): LengthAwarePaginator
    {
        $type = isset($filters['transaction_type'])
            ? TransactionType::from($filters['transaction_type'])
            : null;

        return Property::query()
            ->published()
            ->with(['propertyType', 'agency', 'devise', 'images', 'saleDetail', 'rentalDetail'])
            ->when($type, fn ($q, $t) => $q->forTransaction($t))
            ->when($filters['availability'] ?? null, fn ($q, $v) => $q->where('availability', $v))
            ->when($filters['country'] ?? null, fn ($q, $v) => $q->where('country', $v))
            ->when($filters['region'] ?? null, fn ($q, $v) => $q->where('region', $v))
            ->when($filters['city'] ?? null, fn ($q, $v) => $q->where('city', $v))
            ->when($filters['property_type_id'] ?? null, fn ($q, $v) => $q->where('property_type_id', $v))
            ->when($filters['rooms'] ?? null, fn ($q, $v) => $q->where('rooms', '>=', $v))
            ->when($filters['bedrooms'] ?? null, fn ($q, $v) => $q->where('bedrooms', '>=', $v))
            ->when(array_key_exists('furnished', $filters) && $filters['furnished'] !== null,
                fn ($q) => $q->where('furnished', (bool) $filters['furnished']))
            ->tap(fn (Builder $q) => $this->applyAmountRange($q, $filters, $type))
            ->latest()
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    /**
     * `price_min` / `price_max` mean the sale price on a sale search and the
     * monthly rent on a rental search — one slider on the client, two columns
     * underneath.
     *
     * With no transaction filter, a listing matches if either side falls in the
     * range. Each side is an EXISTS over an indexed column, so the range stays
     * sargable instead of collapsing into a COALESCE no index can serve.
     *
     * @param  Builder<Property>  $query
     * @param  array<string, mixed>  $filters
     */
    private function applyAmountRange(Builder $query, array $filters, ?TransactionType $type): void
    {
        $min = $filters['price_min'] ?? null;
        $max = $filters['price_max'] ?? null;

        if ($min === null && $max === null) {
            return;
        }

        $range = fn (string $column) => function (Builder $q) use ($column, $min, $max) {
            $q->when($min !== null, fn (Builder $q) => $q->where($column, '>=', $min))
                ->when($max !== null, fn (Builder $q) => $q->where($column, '<=', $max));
        };

        match ($type) {
            TransactionType::Sale => $query->whereHas('saleDetail', $range('price')),
            TransactionType::Rent => $query->whereHas('rentalDetail', $range('rent_amount')),
            default => $query->where(fn (Builder $q) => $q
                ->whereHas('saleDetail', $range('price'))
                ->orWhereHas('rentalDetail', $range('rent_amount'))),
        };
    }
}
