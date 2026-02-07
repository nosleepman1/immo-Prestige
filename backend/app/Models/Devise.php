<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devise extends Model
{
    /** @use HasFactory<\Database\Factories\DeviseFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
    ];

    public function properties()
    {
        return $this->hasMany(Property::class);
    }
}
