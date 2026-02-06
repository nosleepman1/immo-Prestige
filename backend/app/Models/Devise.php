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
        'symbol',
     //   'code',
    ];

    public function properties()
    {
        return $this->hasMany(Property::class);
    }
}
