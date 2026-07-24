<?php

namespace App\Actions\Property;

use App\Exceptions\TooManyPropertyImagesException;
use App\Jobs\ResizePropertyImage;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\UploadedFile;

class UploadPropertyImage
{
    public const MAX_IMAGES = 20;

    public function handle(Property $property, UploadedFile $file): PropertyImage
    {
        if ($property->images()->count() >= self::MAX_IMAGES) {
            throw new TooManyPropertyImagesException(self::MAX_IMAGES);
        }

        $isFirst = ! $property->images()->exists();
        $nextPosition = ((int) $property->images()->max('position')) + ($isFirst ? 0 : 1);

        $image = PropertyImage::create([
            'property_id' => $property->id,
            'image_path' => $file->store('property_images', 'public'),
            'is_cover' => $isFirst,
            'position' => $nextPosition,
        ]);

        // Synchronous store above; only the resize is offloaded to a job.
        ResizePropertyImage::dispatch($image->id);

        return $image;
    }
}
