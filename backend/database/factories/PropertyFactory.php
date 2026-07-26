<?php

namespace Database\Factories;

use App\Enums\PropertyAvailability;
use App\Enums\TransactionType;
use App\Models\Agency;
use App\Models\Devise;
use App\Models\PropertyRentalDetail;
use App\Models\PropertySaleDetail;
use App\Models\PropertyType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'property_type_id' => PropertyType::factory(),
            'agency_id' => Agency::factory(),
            'devise_id' => Devise::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->text(),
            'surface' => fake()->randomFloat(2, 20, 500),
            'rooms' => fake()->numberBetween(1, 10),
            'bedrooms' => fake()->numberBetween(1, 4),
            'floor' => fake()->numberBetween(0, 5),
            'furnished' => fake()->boolean(),
            'transaction_type' => TransactionType::Sale,
            'availability' => PropertyAvailability::Available,
            'country' => 'Sénégal',
            'region' => fake()->state(),
            'city' => fake()->city(),
            'longitude' => fake()->longitude(-18.0, -11.0),
            'latitude' => fake()->latitude(12.0, 16.0),
            'status' => 'published',
        ];
    }

    /**
     * A sale listing with its specialisation row. `forSale(750000)` pins the
     * price when a test asserts on it.
     */
    public function forSale(?int $price = null): static
    {
        return $this->state(fn () => ['transaction_type' => TransactionType::Sale])
            ->has(
                PropertySaleDetail::factory()->state(
                    array_filter(['price' => $price], fn ($v) => $v !== null)
                ),
                'saleDetail'
            );
    }

    /**
     * A rental listing with its specialisation row.
     */
    public function forRent(?int $rent = null): static
    {
        return $this->state(fn () => ['transaction_type' => TransactionType::Rent])
            ->has(
                PropertyRentalDetail::factory()->state(
                    array_filter(['rent_amount' => $rent], fn ($v) => $v !== null)
                ),
                'rentalDetail'
            );
    }

    /**
     * Offered for sale and for rent at once — both specialisation rows exist.
     */
    public function forBoth(): static
    {
        return $this->state(fn () => ['transaction_type' => TransactionType::Both])
            ->has(PropertySaleDetail::factory(), 'saleDetail')
            ->has(PropertyRentalDetail::factory(), 'rentalDetail');
    }

    public function availability(PropertyAvailability $availability): static
    {
        return $this->state(fn () => ['availability' => $availability]);
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => 'draft']);
    }

    public function published(): static
    {
        return $this->state(fn () => ['status' => 'published']);
    }
}
