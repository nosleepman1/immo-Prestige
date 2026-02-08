<?php

namespace App\Data;

readonly class RegisterAgencyData
{
    public function __construct(
        public string $companyName,
        public string $managerName,
        public string $description,
        public string $address,
        public string $city,
        public ?string $activityZone,
        public string $phone,
        public string $email,
        public string $idCard,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            companyName: $data['company_name'],
            managerName: $data['manager_name'],
            description: $data['description'],
            address: $data['address'],
            city: $data['city'],
            activityZone: $data['activity_zone'] ?? null,
            phone: $data['phone'],
            email: strtolower($data['email']),
            idCard: $data['id_card'],
        );
    }
}
