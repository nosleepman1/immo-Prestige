<?php

namespace App\Queries;

use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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
        return Property::query()
            ->published()
            ->with(['propertyType', 'agency', 'devise', 'images'])
            ->when($filters['country'] ?? null, fn ($q, $v) => $q->where('country', $v))
            ->when($filters['region'] ?? null, fn ($q, $v) => $q->where('region', $v))
            ->when($filters['city'] ?? null, fn ($q, $v) => $q->where('city', $v))
            ->when($filters['property_type_id'] ?? null, fn ($q, $v) => $q->where('property_type_id', $v))
            ->when($filters['price_min'] ?? null, fn ($q, $v) => $q->where('price', '>=', $v))
            ->when($filters['price_max'] ?? null, fn ($q, $v) => $q->where('price', '<=', $v))
            ->when($filters['rooms'] ?? null, fn ($q, $v) => $q->where('rooms', '>=', $v))
            ->when($filters['bedrooms'] ?? null, fn ($q, $v) => $q->where('bedrooms', '>=', $v))
            ->when(array_key_exists('sold', $filters) && $filters['sold'] !== null,
                fn ($q) => $q->where('sold', (bool) $filters['sold']))
            ->latest()
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }
}
