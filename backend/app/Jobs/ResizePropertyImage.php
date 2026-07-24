<?php

namespace App\Jobs;

use App\Models\PropertyImage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

/**
 * Downscales an uploaded property image in place (GD, no extra dependency)
 * if it exceeds the max width. Runs on the low-priority 'media' queue.
 */
class ResizePropertyImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const MAX_WIDTH = 1600;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function __construct(public int $propertyImageId)
    {
        $this->onQueue('media');
    }

    public function handle(): void
    {
        $image = PropertyImage::find($this->propertyImageId);

        if (! $image) {
            return;
        }

        $disk = Storage::disk('public');

        if (! $disk->exists($image->image_path)) {
            return;
        }

        $contents = $disk->get($image->image_path);
        $info = @getimagesizefromstring($contents);

        if (! $info) {
            return;
        }

        [$width, $height, $type] = $info;

        if ($width <= self::MAX_WIDTH) {
            return;
        }

        $source = @imagecreatefromstring($contents);

        if (! $source) {
            return;
        }

        $newWidth = self::MAX_WIDTH;
        $newHeight = (int) round($height * ($newWidth / $width));
        $resized = imagecreatetruecolor($newWidth, $newHeight);

        if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_GIF, IMAGETYPE_WEBP], true)) {
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
        }

        imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        ob_start();
        match ($type) {
            IMAGETYPE_PNG => imagepng($resized),
            IMAGETYPE_GIF => imagegif($resized),
            IMAGETYPE_WEBP => imagewebp($resized, null, 82),
            default => imagejpeg($resized, null, 82),
        };
        $encoded = ob_get_clean();

        imagedestroy($source);
        imagedestroy($resized);

        $disk->put($image->image_path, $encoded);
    }
}
