import { useState } from 'react';
import { Heart, MessageCircle, MapPin, Bed, Bath, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function RealEstateCard() {
  const [liked, setLiked] = useState(false);


  const property = {
    id: 1,
    title: "Villa Moderne avec Vue Mer",
    location: "Dakar, Almadies",
    price: "450M FCFA",
    bedrooms: 5,
    bathrooms: 4,
    surface: 350,
    likes: 234,
    comments: 18,
    images: [
      "a/public/immo/modele-de-maison-de-villa-cle-et-dessin-sur-retro-bureau-concept-de-vente-immobilier.jpg",
      "/public/immo/modele-de-maison-de-villa-cle-et-dessin-sur-retro-bureau-concept-de-vente-immobilier.jpg",
      "/public/immo/paysage-analogique-de-la-ville-avec-des-batiments.jpg"
    ]
  };

  const handleLike = () => {
    setLiked(!liked);
  };

 

  return (
     <div className="min-h-screen bg-slate-50 dark:bg-gray-950 p-4 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
       
        {/* Carte principale */}
        <Card className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 flex flex-col">
          
          {/* Carrousel d'images */}
          <div className="relative ">

            <div className=" bg-gray-200 dark:bg-gray-900 h-48 md:h-56 lg:h-64 xl:h-72  overflow-hidden rounded-t-md">
             
              <img 
                src={property.images[1]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

            </div>
            
            {/* Bouton Like */}
            <button
              onClick={handleLike}
              className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform duration-200 w-8 h-8 flex items-center justify-center "
            >
              <Heart 
                className={`w-6 h-6 transition-colors ${
                  liked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              />
            </button>

            
          </div>

          <CardContent className="p-3 flex-1 flex flex-col">
            

            {/* Titre */}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 text-sm">
              {property.title}
            </h3>

            {/* Prix */}
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
              {property.price}
            </p>
            
            {/* Localisation */}
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">{property.location}</span>
            </div>

            {/* Caractéristiques */}
            <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-300 mb-3">
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>{property.surface}m²</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800 mb-3">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{property.likes + (liked ? 1 : 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{property.comments}</span>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-2 mt-auto">
              <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-xs font-medium text-gray-900 dark:text-gray-100">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Commenter</span>
              </button>
              <button className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors text-xs font-medium">
                Voir plus
              </button>
            </div>
          </CardContent>
        </Card>

       
      </div>
    </div>
  );
}