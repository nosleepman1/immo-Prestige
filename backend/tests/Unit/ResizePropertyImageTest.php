<?php

namespace Tests\Unit;

use App\Jobs\ResizePropertyImage;
use App\Models\PropertyImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ResizePropertyImageTest extends TestCase
{
    use RefreshDatabase;

    private function putJpeg(string $path, int $width, int $height): void
    {
        $im = imagecreatetruecolor($width, $height);
        ob_start();
        imagejpeg($im);
        $data = ob_get_clean();
        imagedestroy($im);

        Storage::disk('public')->put($path, $data);
    }

    public function test_it_downscales_an_oversized_image_preserving_aspect_ratio(): void
    {
        Storage::fake('public');
        $image = PropertyImage::factory()->create(['image_path' => 'property_images/big.jpg']);
        $this->putJpeg('property_images/big.jpg', 3200, 1600); // 2:1, over the 1600px cap

        (new ResizePropertyImage($image->id))->handle();

        $resized = Storage::disk('public')->get('property_images/big.jpg');
        [$width, $height] = getimagesizefromstring($resized);

        $this->assertSame(1600, $width);
        $this->assertSame(800, $height); // aspect ratio preserved
    }

    public function test_it_re_encodes_an_oversized_webp_as_webp_not_jpeg(): void
    {
        Storage::fake('public');
        $image = PropertyImage::factory()->create(['image_path' => 'property_images/big.webp']);

        $im = imagecreatetruecolor(3200, 1600);
        ob_start();
        imagewebp($im);
        $data = ob_get_clean();
        imagedestroy($im);
        Storage::disk('public')->put('property_images/big.webp', $data);

        (new ResizePropertyImage($image->id))->handle();

        $resized = Storage::disk('public')->get('property_images/big.webp');
        $info = getimagesizefromstring($resized);

        $this->assertSame(1600, $info[0]);
        $this->assertSame(IMAGETYPE_WEBP, $info[2]); // content stays webp, not silently re-encoded as jpeg
    }

    public function test_it_leaves_a_small_image_untouched(): void
    {
        Storage::fake('public');
        $image = PropertyImage::factory()->create(['image_path' => 'property_images/small.jpg']);
        $this->putJpeg('property_images/small.jpg', 800, 600);
        $original = Storage::disk('public')->get('property_images/small.jpg');

        (new ResizePropertyImage($image->id))->handle();

        $this->assertSame($original, Storage::disk('public')->get('property_images/small.jpg'));
    }

    public function test_it_does_nothing_for_a_missing_record_or_file(): void
    {
        Storage::fake('public');

        // Missing record: must not throw.
        (new ResizePropertyImage(999999))->handle();

        // Missing file: must not throw.
        $image = PropertyImage::factory()->create(['image_path' => 'property_images/absent.jpg']);
        (new ResizePropertyImage($image->id))->handle();

        $this->assertFalse(Storage::disk('public')->exists('property_images/absent.jpg'));
    }
}
