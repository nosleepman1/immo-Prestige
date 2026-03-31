<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Comment;
use App\Models\Devise;
use App\Models\Like;
use App\Models\Post;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\PropertyType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Ensure basic types config exist
        $this->call([
            DeviseSeeder::class,
            PropertyTypeSeeder::class,
        ]);

        $devises = Devise::all();
        $propertyTypes = PropertyType::all();
        
        if($devises->isEmpty() || $propertyTypes->isEmpty()){
           $this->command->error('Run DeviseSeeder and PropertyTypeSeeder first or ensure they output data!');
           return;
        }

        // 2. Create 100 normal users
        $this->command->info('Creating 100 normal users...');
        $normalUsers = User::factory()->count(100)->create([
            'password' => Hash::make('passer123'),
            'role' => 'user'
        ]);

        // 3. Create 2 Agency users (tine and aba)
        $this->command->info('Creating 2 Agency users (tine and aba)...');
        $agencyUsersData = [
            ['name' => 'Tine', 'email' => 'tine@gmail.com'],
            ['name' => 'Aba', 'email' => 'aba@gmail.com']
        ];

        foreach ($agencyUsersData as $data) {
            $user = User::factory()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('passer123'),
                'role' => 'agency'
            ]);
            
            // 4. Create Agency entity linked to this user
            $agency = Agency::factory()->create([
                'user_id' => $user->id,
            ]);

            // 5. Create 15 properties for each agency
            for($j = 0; $j < 15; $j++) {
                $property = Property::factory()->create([
                    'agency_id' => $agency->id,
                    'property_type_id' => $propertyTypes->random()->id,
                    'devise_id' => $devises->random()->id,
                ]);

                // 6. Create 1 single image per property
                PropertyImage::factory()->create([
                    'property_id' => $property->id,
                    'image_path' => 'https://picsum.photos/600/400?random=' . rand(1, 10000),
                    'is_cover' => true,
                ]);

                // Create Post for property
                $post = Post::factory()->create([
                    'user_id' => $user->id,
                    'property_id' => $property->id,
                ]);

                // 7. Likes and Comments on these posts
                $postCommenters = $normalUsers->random(rand(2, 5));
                foreach($postCommenters as $commenter) {
                    Comment::factory()->create([
                        'post_id' => $post->id,
                        'user_id' => $commenter->id,
                    ]);
                }

                $postLikers = $normalUsers->random(rand(5, 15));
                foreach($postLikers as $liker) {
                    Like::factory()->create([
                        'post_id' => $post->id,
                        'user_id' => $liker->id,
                    ]);
                }
            }
        }

        $this->command->info('Seeding completed successfully!');
    }
}
