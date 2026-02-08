<?php

namespace App\Data;

readonly class RegisterUserData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $role,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: strtolower($data['email']),
            password: $data['password'],
            role: $data['role'] ?? 'user',
        );
    }
}
