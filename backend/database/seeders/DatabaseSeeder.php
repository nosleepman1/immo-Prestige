<?php

namespace Database\Seeders;

use App\Enums\SubscriptionStatus;
use App\Models\Agency;
use App\Models\Comment;
use App\Models\CommentReply;
use App\Models\ContractClause;
use App\Models\ContractTemplate;
use App\Models\Devise;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use App\Models\Like;
use App\Models\Owner;
use App\Models\Payment;
use App\Models\Post;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\PropertyRentalDetail;
use App\Models\PropertySaleDetail;
use App\Models\PropertyType;
use App\Models\RentalApplication;
use App\Models\RentalApplicationDocument;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with rich, realistic Senegalese real estate data.
     */
    public function run(): void
    {
        $this->command->info('🚀 Démarrage du Seeder Immo-Prestige avec 22+ biens réels pour abashable08@gmail.com...');

        // 1. Core Seeders (Devises, Types, Plans, Settings)
        $this->call([
            DeviseSeeder::class,
            PropertyTypeSeeder::class,
            PlanSeeder::class,
            SettingsSeeder::class,
        ]);

        $xofDevise = Devise::where('code', 'XOF')->first() ?? Devise::first();
        $propertyTypes = PropertyType::all();

        // 2. Super Admin Account
        $admin = User::updateOrCreate(
            ['email' => 'abdallahdiouf.dev@gmail.com'],
            [
                'name' => 'Abdallah DIOUF',
                'password' => Hash::make('passer123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
        $this->command->info("👑 Admin créé : abdallahdiouf.dev@gmail.com / passer123");

        // 3. User Accounts with authentic Senegalese names
        $senegaleseNames = [
            'Mamadou Lamine Diallo', 'Awa Seck', 'Cheikh Tidiane Sy', 'Fatou Binetou Ndiaye',
            'Ousmane Faye', 'Mariama Ba', 'Babacar Sow', 'Khadija Gueye', 'Amadou Makhtar Mbow',
            'Aminata Touré', 'Pathé Diagne', 'Salimata Kane', 'Serigne Fallou Sarr', 'Aïssatou Tall',
            'Boubacar Boris Diop', 'Sokhna Ndack Cissé', 'Oumar Tatam Ly', 'Yacine Samb', 'Demba Ba',
            'Seynabou Diop', 'Alioune Badara Mbengue', 'Adji Sarr', 'Modou Lo', 'Astou Kane',
            'Moustapha Niang', 'Coumba Gawlo Seck', 'Massaër Diallo', 'Fama Thioune', 'Lamine Sané',
            'Ndeye Marie Fall', 'Djibril Cissé', 'Khady Diouf', 'Ibrahima Faye', 'Codou Badiane'
        ];

        $normalUsers = collect();
        foreach ($senegaleseNames as $index => $fullName) {
            $emailName = strtolower(str_replace(' ', '.', preg_replace('/[^a-zA-Z0-9 ]/', '', $fullName)));
            $user = User::updateOrCreate(
                ['email' => "{$emailName}@gmail.com"],
                [
                    'name' => $fullName,
                    'password' => Hash::make('passer123'),
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]
            );
            $normalUsers->push($user);
        }

        // Real image collections for Senegalese architecture
        $realImagePools = [
            'villas' => [
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            ],
            'apartments' => [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
            ],
            'offices' => [
                'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
            ],
            'land' => [
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1200&q=80'
            ]
        ];

        // 22 Authentic Senegalese Properties Dataset for Prestige Immobilier Sénégal (abashable08)
        $abashPropertiesDataset = [
            [
                'name' => 'Villa Contemporaine Almadies Zone 15',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 450,
                'rooms' => 6,
                'bedrooms' => 4,
                'transaction_type' => 'sale',
                'price' => 480000000,
                'negotiable' => true,
                'category' => 'villas',
                'description' => "Superbe villa d'architecte aux Almadies. 4 suites parentales avec dressing, piscine à débordement, groupe électrogène automatique, réserve d'eau 5000L et garage fermé pour 3 véhicules. Sécurité 24h/24.",
            ],
            [
                'name' => 'Appartement Haut Standing F4 Mermoz Pyrotechnie',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 165,
                'rooms' => 4,
                'bedrooms' => 3,
                'transaction_type' => 'rent',
                'rent_amount' => 850000,
                'charges_amount' => 50000,
                'deposit_amount' => 1700000,
                'advance_months' => 2,
                'category' => 'apartments',
                'description' => "Appartement neuf et lumineux situé au 3ème étage avec ascenseur. Cuisine équipée d'origine européenne, salon spacieux ouvrant sur balcon avec vue dégagée, gardiennage et groupe électrogène.",
            ],
            [
                'name' => 'Villa de Vacances Pieds dans l\'Eau Somone',
                'city' => 'Mbour',
                'region' => 'Thies',
                'country' => 'Sénégal',
                'surface' => 380,
                'rooms' => 5,
                'bedrooms' => 4,
                'transaction_type' => 'sale',
                'price' => 275000000,
                'negotiable' => true,
                'category' => 'villas',
                'description' => "Accès direct à la lagune et à la plage de Somone. Jardin tropical arboré avec cocotiers, piscine privée, paillote aménagée et logement indépendant pour le personnel.",
            ],
            [
                'name' => 'Duplex de Prestige Vue Mer Mamelles Ngor',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 220,
                'rooms' => 5,
                'bedrooms' => 3,
                'transaction_type' => 'both',
                'price' => 210000000,
                'rent_amount' => 1200000,
                'charges_amount' => 75000,
                'deposit_amount' => 2400000,
                'advance_months' => 2,
                'category' => 'apartments',
                'description' => "Duplex d'exception au pied du Phare des Mamelles. Terrasse panoramique avec jacuzzi, finition marbre au sol, climatisation centrale VRV et 2 places de parking en sous-sol.",
            ],
            [
                'name' => 'Immeuble Commercial & Bureaux Point E',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 600,
                'rooms' => 12,
                'bedrooms' => 0,
                'transaction_type' => 'rent',
                'rent_amount' => 3500000,
                'charges_amount' => 250000,
                'deposit_amount' => 7000000,
                'advance_months' => 3,
                'category' => 'offices',
                'description' => "Immeuble R+3 idéal pour sièges de société ou multinationales. Open spaces modulables, salle de serveur climatisée, groupe électrogène Caterpillar 150 kVA, ascenseur Otis.",
            ],
            [
                'name' => 'Terrain Viabilisé 500m² Diamniadio Cité Ministérielle',
                'city' => 'Rufisque',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 500,
                'rooms' => 0,
                'bedrooms' => 0,
                'transaction_type' => 'sale',
                'price' => 35000000,
                'negotiable' => false,
                'category' => 'land',
                'description' => "Lotissement approuvé avec Titre Foncier individuel. Eau, électricité, voie bitumée et réseaux d'assainissement déjà installés. Emplacement stratégique à 5 mn de l'AIBD.",
            ],
            [
                'name' => 'Résidence Standing F3 Point E Canal',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 110,
                'rooms' => 3,
                'bedrooms' => 2,
                'transaction_type' => 'rent',
                'rent_amount' => 600000,
                'charges_amount' => 40000,
                'deposit_amount' => 1200000,
                'advance_months' => 2,
                'category' => 'apartments',
                'description' => "Appartement idéal pour jeune couple ou cadre. Quartier résidentiel très calme et sécurisé, proximité immédiate des banques et écoles internationales.",
            ],
            [
                'name' => 'Villa avec Piscine Saly Golf Portudal',
                'city' => 'Mbour',
                'region' => 'Thies',
                'country' => 'Sénégal',
                'surface' => 300,
                'rooms' => 5,
                'bedrooms' => 3,
                'transaction_type' => 'sale',
                'price' => 145000000,
                'negotiable' => true,
                'category' => 'villas',
                'description' => "Villa située en bordure du parcours du Golf de Saly. Vendu entièrement meublé et équipé. Batterie solaire de secours et puits avec surpresseur.",
            ],
            [
                'name' => 'Appartement F5 Penthouse Fann Résidence',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 280,
                'rooms' => 5,
                'bedrooms' => 4,
                'transaction_type' => 'both',
                'price' => 350000000,
                'rent_amount' => 2000000,
                'charges_amount' => 100000,
                'deposit_amount' => 4000000,
                'advance_months' => 2,
                'category' => 'apartments',
                'description' => "Penthouse d'exception occupant le dernier étage avec vue à 360° sur l'Océan Atlantique. Finitions haut de gamme, domotique et conciergerie privée 24h/24.",
            ],
            [
                'name' => 'Villa Bassari Ngor Virage',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 320,
                'rooms' => 5,
                'bedrooms' => 3,
                'transaction_type' => 'sale',
                'price' => 230000000,
                'negotiable' => true,
                'category' => 'villas',
                'description' => "Villa chaleureuse située dans le secteur très prisé du Virage. Cuisine américaine, suite parentale à l'étage avec vue mer partielle et piscine cour arrière.",
            ],
            [
                'name' => 'Appartement F3 Neuf Ouakam Cité Avion',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 95,
                'rooms' => 3,
                'bedrooms' => 2,
                'transaction_type' => 'rent',
                'rent_amount' => 450000,
                'charges_amount' => 25000,
                'deposit_amount' => 900000,
                'advance_months' => 2,
                'category' => 'apartments',
                'description' => "Appartement très accessible, proche de l'avenue Cheikh Anta Diop. Résidence sécurisée avec système d'interphone et gardiennage.",
            ],
            [
                'name' => 'Plateau de Bureaux 250m² Plateau Avenue Roume',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 250,
                'rooms' => 6,
                'bedrooms' => 0,
                'transaction_type' => 'rent',
                'rent_amount' => 1800000,
                'charges_amount' => 120000,
                'deposit_amount' => 3600000,
                'advance_months' => 2,
                'category' => 'offices',
                'description' => "Emplacement commercial stratégique en plein centre-ville Dakar Plateau. Bureaux entièrement câblés en fibre optique, climatisation et contrôle d'accès.",
            ],
            [
                'name' => 'Parcelle Foncier 1000m² Popenguine Falaise',
                'city' => 'Mbour',
                'region' => 'Thies',
                'country' => 'Sénégal',
                'surface' => 1000,
                'rooms' => 0,
                'bedrooms' => 0,
                'transaction_type' => 'sale',
                'price' => 65000000,
                'negotiable' => true,
                'category' => 'land',
                'description' => "Superbe terrain d'angle avec vue dominante sur la réserve naturelle de Popenguine et la mer. Titre Foncier disponible et prêt pour construction.",
            ],
            [
                'name' => 'Villa Moderne Sacré-Cœur 3 Pyrotechnie',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 250,
                'rooms' => 5,
                'bedrooms' => 3,
                'transaction_type' => 'sale',
                'price' => 165000000,
                'negotiable' => true,
                'category' => 'villas',
                'description' => "Villa familiale R+1 entièrement rénovée avec goût. Grand salon, cuisine moderne, garage 2 voitures et terrasse aménagée en rooftop.",
            ],
            [
                'name' => 'Studio Meublé Executive Almadies Almadies',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 55,
                'rooms' => 1,
                'bedrooms' => 1,
                'transaction_type' => 'rent',
                'rent_amount' => 500000,
                'charges_amount' => 50000,
                'deposit_amount' => 1000000,
                'advance_months' => 1,
                'category' => 'apartments',
                'description' => "Studio moderne équipé avec goût. Idéal pour consultants ou séjours professionnels de moyenne à longue durée aux Almadies.",
            ],
            [
                'name' => 'Villa de Charme Ngaparou avec Dépendance',
                'city' => 'Mbour',
                'region' => 'Thies',
                'country' => 'Sénégal',
                'surface' => 400,
                'rooms' => 6,
                'bedrooms' => 4,
                'transaction_type' => 'sale',
                'price' => 195000000,
                'negotiable' => true,
                'category' => 'villas',
                'description' => "Propriété de caractère dans un quartier calme de Ngaparou à 500m de la plage. Grande piscine, jardin paysager et studio d'amis indépendant.",
            ],
            [
                'name' => 'Appartement F4 Standing Cité Keur Gorgui',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 140,
                'rooms' => 4,
                'bedrooms' => 3,
                'transaction_type' => 'rent',
                'rent_amount' => 700000,
                'charges_amount' => 45000,
                'deposit_amount' => 1400000,
                'advance_months' => 2,
                'category' => 'apartments',
                'description' => "Très bel appartement au cœur du quartier d'affaires Keur Gorgui. Proche des sièges sociaux et commerces, sécurité 24/7.",
            ],
            [
                'name' => 'Terrain 400m² Nianing Bord de Mer',
                'city' => 'Mbour',
                'region' => 'Thies',
                'country' => 'Sénégal',
                'surface' => 400,
                'rooms' => 0,
                'bedrooms' => 0,
                'transaction_type' => 'sale',
                'price' => 22000000,
                'negotiable' => false,
                'category' => 'land',
                'description' => "Parcelle idéale pour villa de vacances à Nianing. Secteur résidentiel en plein essor, électricité et eau à proximité.",
            ],
            [
                'name' => 'Villa R+2 de Standing Ouest Foire',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 270,
                'rooms' => 6,
                'bedrooms' => 4,
                'transaction_type' => 'sale',
                'price' => 175000000,
                'negotiable' => true,
                'category' => 'villas',
                'description' => "Villa spacieuse R+2 avec finitions de qualité supérieure. Plusieurs balcons, grande cuisine équipée et suite parentale au 2ème étage.",
            ],
            [
                'name' => 'Appartement F3 Vue Lagune Somone',
                'city' => 'Mbour',
                'region' => 'Thies',
                'country' => 'Sénégal',
                'surface' => 90,
                'rooms' => 3,
                'bedrooms' => 2,
                'transaction_type' => 'rent',
                'rent_amount' => 400000,
                'charges_amount' => 30000,
                'deposit_amount' => 800000,
                'advance_months' => 2,
                'category' => 'apartments',
                'description' => "Appartement de vacances cosy avec terrasse surplombant la lagune de Somone. Résidence sécurisée avec piscine commune.",
            ],
            [
                'name' => 'Entrepôt Logistique 1200m² Zone Industrielle Rufisque',
                'city' => 'Rufisque',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 1200,
                'rooms' => 4,
                'bedrooms' => 0,
                'transaction_type' => 'rent',
                'rent_amount' => 4500000,
                'charges_amount' => 300000,
                'deposit_amount' => 9000000,
                'advance_months' => 3,
                'category' => 'offices',
                'description' => "Grand hangar de stockage industriel avec bureaux administratifs intégrés, quai de déchargement camions et accès direct autoroute à péage.",
            ],
            [
                'name' => 'Villa de Luxe Les Almadies Ambassades',
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'Sénégal',
                'surface' => 650,
                'rooms' => 8,
                'bedrooms' => 5,
                'transaction_type' => 'sale',
                'price' => 750000000,
                'negotiable' => true,
                'category' => 'villas',
                'description' => "Propriété d'exception située dans la zone diplomatique des Almadies. Piscine olympique, vaste jardin paysager, logements du personnel et sécurité maximale.",
            ],
        ];

        // Authentic Senegalese Comments & Replies
        $senegaleseComments = [
            "Machallah, très beau bien ! Est-ce que le titre foncier est individuel ?",
            "Bonjour, les visites sont-elles possibles ce samedi après-midi ?",
            "Magnifique finition aux Almadies. Le prix est-il négociable pour un paiement comptant ?",
            "Très bon emplacement au Point E. Est-ce que les charges comprennent l'entretien du groupe électrogène ?",
            "J'ai visité la semaine dernière, quartier calme et accessible. Je recommande l'agence !",
            "Salam, qu'en est-il de la disponibilité du bien pour une entrée immédiate ?"
        ];

        $senegaleseReplies = [
            "Wa alaykoum salam, oui le titre foncier est direct et parfait. N'hésitez pas à nous contacter par message.",
            "Bonjour, oui les visites sont organisées sur rendez-vous de 9h à 17h. Contactez notre agent.",
            "Merci pour votre intérêt ! Une légère négociation est envisageable après la visite.",
            "Bonjour, oui les charges incluent le gardiennage 24h/24, le nettoyage des communs et la maintenance du groupe."
        ];

        // 4. Agencies Configuration
        $agenciesData = [
            [
                'user_email' => 'abashable08@gmail.com',
                'user_name' => 'Abdoulaye Bamba',
                'company_name' => 'Prestige Immobilier Sénégal',
                'manager_name' => 'Abdoulaye Bamba',
                'description' => 'Leader de l\'immobilier de prestige au Sénégal. Spécialiste de la vente et gestion locative haut de gamme à Dakar, Saly et Cap Skirring.',
                'address' => 'Avenue Cheikh Anta Diop, Immeuble Horizon',
                'city' => 'Dakar',
                'activity_zone' => 'Dakar, Petite Côte, Saint-Louis',
                'phone' => '+221 77 375 07 07',
                'id_card' => '1648200008891',
                'is_verified' => true,
                'properties' => $abashPropertiesDataset,
            ],
            [
                'user_email' => 'teranga.immo@gmail.com',
                'user_name' => 'Saliou Ndiaye',
                'company_name' => 'Téranga Habitat & Gestion',
                'manager_name' => 'Saliou Ndiaye',
                'description' => 'Agence immobilière sénégalaise engagée pour l\'accès au logement de qualité et le suivi personnalisé des investisseurs de la diaspora.',
                'address' => 'Résidence les Almadies, Zone 12',
                'city' => 'Dakar',
                'activity_zone' => 'Almadies, Ngor, Ouakam, Mermoz',
                'phone' => '+221 78 120 44 55',
                'id_card' => '1648200007742',
                'is_verified' => true,
                'properties' => array_slice($abashPropertiesDataset, 0, 5),
            ],
            [
                'user_email' => 'baobab.foncier@gmail.com',
                'user_name' => 'Mariama Kébé',
                'company_name' => 'Baobab Foncier & Villes Nouvelles',
                'manager_name' => 'Mariama Kébé',
                'description' => 'Spécialiste de l\'aménagement foncier, des parcelles viabilisées et des villas modernes à Diamniadio, Rose et Lac Rose.',
                'address' => 'Cité Keur Gorgui, Immeuble Tamaro',
                'city' => 'Dakar',
                'activity_zone' => 'Diamniadio, Rufisque, Lac Rose',
                'phone' => '+221 76 540 11 22',
                'id_card' => '1648200003312',
                'is_verified' => false,
                'properties' => array_slice($abashPropertiesDataset, 5, 5),
            ],
            [
                'user_email' => 'saly.residences@gmail.com',
                'user_name' => 'Jean-Michel Faye',
                'company_name' => 'Saly Palm Residences',
                'manager_name' => 'Jean-Michel Faye',
                'description' => 'Agence spécialiste de la vente de villas de vacances, pieds dans l\'eau et résidences hôtelières sur la Petite Côte.',
                'address' => 'Route de Saly Joseph, Saly Portudal',
                'city' => 'Mbour',
                'activity_zone' => 'Saly, Somone, Ngaparou, Popenguine',
                'phone' => '+221 77 888 99 00',
                'id_card' => '1648200004455',
                'is_verified' => true,
                'properties' => array_slice($abashPropertiesDataset, 10, 5),
            ]
        ];

        foreach ($agenciesData as $agencyData) {
            // Create Agency User
            $agencyUser = User::updateOrCreate(
                ['email' => $agencyData['user_email']],
                [
                    'name' => $agencyData['user_name'],
                    'password' => Hash::make('passer123'),
                    'role' => 'agency',
                    'email_verified_at' => now(),
                ]
            );

            // Create Agency Profile
            $agency = Agency::updateOrCreate(
                ['user_id' => $agencyUser->id],
                [
                    'company_name' => $agencyData['company_name'],
                    'manager_name' => $agencyData['manager_name'],
                    'description' => $agencyData['description'],
                    'address' => $agencyData['address'],
                    'city' => $agencyData['city'],
                    'activity_zone' => $agencyData['activity_zone'],
                    'phone' => $agencyData['phone'],
                    'id_card' => $agencyData['id_card'],
                    'status' => 'accepted',
                    'activated_at' => now(),
                    'verified_until' => $agencyData['is_verified'] ? now()->addYear() : null,
                ]
            );

            // Create Active Subscription
            Subscription::updateOrCreate(
                ['agency_id' => $agency->id],
                [
                    'status' => SubscriptionStatus::Active,
                    'starts_at' => now()->subMonths(2),
                    'trial_ends_at' => now()->addMonths(10),
                ]
            );

            // Create Mandate Owners for agency
            $owners = collect([
                Owner::create([
                    'agency_id' => $agency->id,
                    'first_name' => 'El Hadji',
                    'last_name' => 'Ndiaye',
                    'email' => 'elhadji.ndiaye@gmail.com',
                    'phone' => '+221 77 633 22 11',
                    'address' => 'Fann Résidence, Dakar',
                ]),
                Owner::create([
                    'agency_id' => $agency->id,
                    'first_name' => 'Seynabou',
                    'last_name' => 'Diallo',
                    'email' => 'seynabou.diallo@gmail.com',
                    'phone' => '+221 78 455 10 90',
                    'address' => 'Saly Portudal, Mbour',
                ])
            ]);

            // Create Properties for this agency
            foreach ($agencyData['properties'] as $propData) {
                $property = Property::create([
                    'agency_id' => $agency->id,
                    'owner_id' => $owners->random()->id,
                    'property_type_id' => $propertyTypes->random()->id,
                    'devise_id' => $xofDevise->id,
                    'name' => $propData['name'],
                    'description' => $propData['description'],
                    'surface' => $propData['surface'],
                    'rooms' => $propData['rooms'],
                    'bedrooms' => $propData['bedrooms'],
                    'country' => $propData['country'],
                    'region' => $propData['region'],
                    'city' => $propData['city'],
                    'transaction_type' => $propData['transaction_type'],
                    'availability' => 'available',
                    'status' => 'published',
                ]);

                // Create Sale or Rental Details
                if ($propData['transaction_type'] === 'sale' || $propData['transaction_type'] === 'both') {
                    PropertySaleDetail::create([
                        'property_id' => $property->id,
                        'price' => $propData['price'] ?? 150000000,
                        'negotiable' => $propData['negotiable'] ?? true,
                    ]);
                }

                if ($propData['transaction_type'] === 'rent' || $propData['transaction_type'] === 'both') {
                    PropertyRentalDetail::create([
                        'property_id' => $property->id,
                        'rent_amount' => $propData['rent_amount'] ?? 500000,
                        'charges_amount' => $propData['charges_amount'] ?? 30000,
                        'deposit_amount' => $propData['deposit_amount'] ?? 1000000,
                        'advance_months' => $propData['advance_months'] ?? 2,
                        'min_lease_months' => 12,
                        'available_from' => now()->addDays(5),
                    ]);
                }

                // Add Real Images from Pool
                $pool = $realImagePools[$propData['category']] ?? $realImagePools['villas'];
                foreach ($pool as $imgIndex => $imgUrl) {
                    PropertyImage::create([
                        'property_id' => $property->id,
                        'image_path' => $imgUrl,
                        'is_cover' => $imgIndex === 0,
                        'position' => $imgIndex,
                    ]);
                }

                // Create Social Post for property
                $post = Post::create([
                    'user_id' => $agencyUser->id,
                    'property_id' => $property->id,
                ]);

                // Add Likes from Real Senegalese Users
                $likers = $normalUsers->random(rand(8, 25));
                foreach ($likers as $liker) {
                    Like::firstOrCreate([
                        'post_id' => $post->id,
                        'user_id' => $liker->id,
                    ]);
                }

                // Add Comments & Replies from Real Senegalese Users
                $commenters = $normalUsers->random(rand(2, 4));
                foreach ($commenters as $commenterIndex => $commenter) {
                    $commentText = $senegaleseComments[($property->id + $commenterIndex) % count($senegaleseComments)];
                    $comment = Comment::create([
                        'post_id' => $post->id,
                        'user_id' => $commenter->id,
                        'content' => $commentText,
                    ]);

                    // Add Reply from Agency or other user for realistic interaction
                    if ($commenterIndex % 2 === 0) {
                        $replyText = $senegaleseReplies[($comment->id) % count($senegaleseReplies)];
                        CommentReply::create([
                            'comment_id' => $comment->id,
                            'user_id' => $agencyUser->id,
                            'content' => $replyText,
                        ]);
                    }
                }
            }

            $count = count($agencyData['properties']);
            $this->command->info("🏢 Agence inscrite ({$count} biens) : {$agencyData['company_name']} ({$agencyData['user_email']})");
        }

        // 5. Seed Contract Templates, Rental Applications, Leases, PDF contracts & Payment Installments for abashable08
        $abashUser = User::where('email', 'abashable08@gmail.com')->first();
        $abashAgency = Agency::where('user_id', $abashUser->id)->first();

        if ($abashAgency) {
            $this->command->info("📜 Génération des Modèles de Contrats, Candidatures et Baux Locatifs pour {$abashAgency->company_name}...");

            // Create Contract Template with Senegalese Legal Clauses
            $template = ContractTemplate::create([
                'agency_id' => $abashAgency->id,
                'name' => 'Contrat de Bail à Usage d\'Habitation Standard (Loi Sénégalaise N° 2014-03)',
                'is_default' => true,
            ]);

            $clauses = [
                ['title' => 'Article 1 : Objet du Contrat', 'body' => 'Le présent contrat a pour objet la location à usage d\'habitation exclusive du bien immobilier désigné.', 'position' => 1, 'is_required' => true],
                ['title' => 'Article 2 : Durée et Renouvellement', 'body' => 'Le bail est conclu pour une durée déterminée d\'un (1) an renouvelable par tacite reconduction sauf préavis de trois (3) mois.', 'position' => 2, 'is_required' => true],
                ['title' => 'Article 3 : Loyer et Charges', 'body' => 'Le loyer mensuel est payable d\'avance au plus tard le 5 de chaque mois par virement ou chèque bancaire à l\'agence.', 'position' => 3, 'is_required' => true],
                ['title' => 'Article 4 : Dépôt de Garantie', 'body' => 'Un dépôt de garantie équivalent à 2 mois de loyer hors charges est versé à la signature et restituable en fin de bail.', 'position' => 4, 'is_required' => true],
                ['title' => 'Article 5 : Entretien et Réparations', 'body' => 'Le preneur est tenu d\'entretenir les lieux en bon père de famille et d\'exécuter les réparations locatives d\'usage.', 'position' => 5, 'is_required' => true],
            ];

            foreach ($clauses as $clauseData) {
                ContractClause::create([
                    'contract_template_id' => $template->id,
                    'title' => $clauseData['title'],
                    'body' => $clauseData['body'],
                    'position' => $clauseData['position'],
                    'is_required' => $clauseData['is_required'],
                ]);
            }

            // Pick 5 rentable properties for Leases and Rental Applications
            $rentableProperties = Property::with(['rentalDetail'])->where('agency_id', $abashAgency->id)
                ->whereIn('transaction_type', ['rent', 'both'])
                ->take(5)
                ->get();

            $applicants = $normalUsers->take(5);

            foreach ($rentableProperties as $idx => $property) {
                $applicant = $applicants[$idx];
                $rentalDetail = $property->rentalDetail;
                $rentAmount = $rentalDetail?->rent_amount ?? 650000;
                $chargesAmount = $rentalDetail?->charges_amount ?? 40000;
                $depositAmount = $rentalDetail?->deposit_amount ?? ($rentAmount * 2);

                // Create Validated Rental Application
                $application = \App\Models\RentalApplication::create([
                    'property_id' => $property->id,
                    'agency_id' => $abashAgency->id,
                    'applicant_user_id' => $applicant->id,
                    'status' => \App\Enums\RentalApplicationStatus::Accepted,
                    'desired_start_date' => now()->subMonths(3)->addDays($idx * 5),
                    'desired_duration_months' => 12,
                    'message' => "Bonjour, je suis très intéressé par la location de cet appartement au nom de ma famille. Mon dossier de garanties financières est complet.",
                    'reviewed_by' => $abashUser->id,
                    'reviewed_at' => now()->subMonths(3)->addDays($idx * 5 + 1),
                ]);

                // Create Application Documents
                \App\Models\RentalApplicationDocument::create([
                    'rental_application_id' => $application->id,
                    'type' => \App\Enums\RentalDocumentType::IdentityDocument,
                    'file_path' => 'rental_documents/cni_tenant_' . $applicant->id . '.pdf',
                    'original_name' => 'CNI_' . str_replace(' ', '_', $applicant->name) . '.pdf',
                    'size_bytes' => 1024500,
                    'mime_type' => 'application/pdf',
                ]);
                \App\Models\RentalApplicationDocument::create([
                    'rental_application_id' => $application->id,
                    'type' => \App\Enums\RentalDocumentType::ProofOfIncome,
                    'file_path' => 'rental_documents/bulletin_paie_' . $applicant->id . '.pdf',
                    'original_name' => 'Bulletins_Paie_3DerniersMois.pdf',
                    'size_bytes' => 2048000,
                    'mime_type' => 'application/pdf',
                ]);

                // Lease Status Lifecycle (Active, Pending Signature, Pending Validation, Pending Payment)
                $leaseStatuses = [
                    \App\Enums\LeaseStatus::Active,
                    \App\Enums\LeaseStatus::Active,
                    \App\Enums\LeaseStatus::PendingSignature,
                    \App\Enums\LeaseStatus::PendingValidation,
                    \App\Enums\LeaseStatus::PendingPayment,
                ];

                $leaseStatus = $leaseStatuses[$idx % count($leaseStatuses)];
                $startDate = now()->subMonths(3)->addDays($idx * 5 + 2);
                $endDate = $startDate->copy()->addYear();

                $lease = Lease::create([
                    'reference' => sprintf('BAIL-%d-%05d', now()->year, $idx + 1),
                    'property_id' => $property->id,
                    'agency_id' => $abashAgency->id,
                    'tenant_user_id' => $applicant->id,
                    'owner_id' => $property->owner_id,
                    'rental_application_id' => $application->id,
                    'contract_template_id' => $template->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'duration_months' => 12,
                    'rent_amount' => $rentAmount,
                    'charges_amount' => $chargesAmount,
                    'deposit_amount' => $depositAmount,
                    'advance_months' => 2,
                    'periodicity' => \App\Enums\LeasePeriodicity::Monthly,
                    'payment_day' => 5,
                    'notice_period_days' => 90,
                    'status' => $leaseStatus,
                    'generated_contract_path' => 'contracts/generated_' . sprintf('BAIL-%d-%05d', now()->year, $idx + 1) . '.pdf',
                    'signed_contract_path' => in_array($leaseStatus, [\App\Enums\LeaseStatus::Active]) ? 'contracts/signed_' . sprintf('BAIL-%d-%05d', now()->year, $idx + 1) . '.pdf' : null,
                    'signed_at' => in_array($leaseStatus, [\App\Enums\LeaseStatus::Active]) ? $startDate->copy()->subDays(2) : null,
                    'validated_by' => in_array($leaseStatus, [\App\Enums\LeaseStatus::Active]) ? $abashUser->id : null,
                    'validated_at' => in_array($leaseStatus, [\App\Enums\LeaseStatus::Active]) ? $startDate->copy()->subDays(1) : null,
                ]);

                // Update property availability if lease is Active
                if ($leaseStatus === \App\Enums\LeaseStatus::Active) {
                    $property->update(['availability' => \App\Enums\PropertyAvailability::Rented]);
                }

                // Generate Monthly Installments & Receipts for Active Leases
                if ($leaseStatus === \App\Enums\LeaseStatus::Active) {
                    for ($m = 0; $m < 4; $m++) {
                        $periodStart = $startDate->copy()->addMonths($m)->startOfMonth();
                        $periodEnd = $periodStart->copy()->endOfMonth();
                        $dueDate = $periodStart->copy()->day(5);
                        $isPaid = $m < 3; // First 3 months paid, current month pending

                        $installment = \App\Models\LeaseInstallment::create([
                            'lease_id' => $lease->id,
                            'reference' => sprintf('QUIT-%d-%05d', now()->year, ($idx * 4) + $m + 1),
                            'period_start' => $periodStart,
                            'period_end' => $periodEnd,
                            'due_date' => $dueDate,
                            'rent_amount' => $rentAmount,
                            'charges_amount' => $chargesAmount,
                            'total_amount' => $rentAmount + $chargesAmount,
                            'paid_amount' => $isPaid ? ($rentAmount + $chargesAmount) : 0,
                            'status' => $isPaid ? \App\Enums\InstallmentStatus::Paid : \App\Enums\InstallmentStatus::Pending,
                            'paid_at' => $isPaid ? $dueDate->copy()->subDays(rand(0, 3)) : null,
                            'receipt_path' => $isPaid ? 'receipts/quittance_' . sprintf('QUIT-%d-%05d', now()->year, ($idx * 4) + $m + 1) . '.pdf' : null,
                        ]);

                        if ($isPaid) {
                            $payment = \App\Models\Payment::create([
                                'agency_id' => $abashAgency->id,
                                'lease_id' => $lease->id,
                                'payer_user_id' => $applicant->id,
                                'purpose' => \App\Enums\PaymentPurpose::Rent,
                                'amount' => $rentAmount + $chargesAmount,
                                'status' => \App\Enums\PaymentStatus::Paid,
                                'provider' => 'paydunya',
                                'method' => \App\Enums\PaymentMethod::PayDunya,
                                'validated_by' => $abashUser->id,
                                'validated_at' => $dueDate->copy()->subDays(1),
                            ]);

                            $installment->payments()->attach($payment->id, [
                                'applied_amount' => $rentAmount + $chargesAmount,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }
        }

        // Run Demo Data Seeder for extra conversations and reports
        $this->call([
            DemoDataSeeder::class,
        ]);

        $this->command->info('✨ SEEDING COMPLET : BIENS, CONTRATS, DOSSIDES LOCATIFS ET QUITTANCES GÉNÉRÉS !');
        $this->command->info('----------------------------------------------------');
        $this->command->info('👑 Super Admin : abdallahdiouf.dev@gmail.com / passer123');
        $this->command->info('🏢 Agence Démo  : abashable08@gmail.com / passer123 (22 biens, 5 baux, contrats & quittances)');
        $this->command->info('----------------------------------------------------');
    }
}
