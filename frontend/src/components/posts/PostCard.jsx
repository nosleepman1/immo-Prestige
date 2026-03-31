import React from 'react'
import { Heart, MessageCircle, Share2, MapPin, Building, BedDouble, Expand } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PostCard({ post }) {
  const { property, user, likes_count, comments_count, created_at } = post
  
  const coverImage = property?.images?.find(img => img.is_cover)?.image_path || property?.images?.[0]?.image_path || 'https://placehold.co/600x400?text=No+Image'
  
  const formattedDate = created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr }) : ''

  return (
    <div className="bg-card text-card-foreground border border-border sm:rounded-xl overflow-hidden shadow-sm mb-6 max-w-lg mx-auto w-full transition-colors duration-200">
      
      {/* Header - Agency Info */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-border">
            {user?.name ? user.name.charAt(0).toUpperCase() : <Building size={20} />}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{user?.name || 'Agence Immobilière'}</h3>
            <p className="text-xs text-muted-foreground flex items-center mt-0.5">
              <MapPin size={12} className="mr-1" />
              {property?.city}, {property?.country}
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {formattedDate}
        </div>
      </div>

      {/* Main Image */}
      <Link to={`/properties/${property?.id}`}>
        <div className="relative aspect-square sm:aspect-[4/3] w-full bg-muted cursor-pointer overflow-hidden group">
          <img 
            src={coverImage} 
            alt={property?.name || 'Property'} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {property?.sold && (
            <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Vendu
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <span className="bg-background/80 text-foreground px-4 py-2 rounded-full font-medium text-sm backdrop-blur-sm shadow-sm flex items-center">
               <Expand size={16} className="mr-2" />
               Voir les détails
             </span>
          </div>
        </div>
      </Link>

      {/* Action Bar */}
      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex space-x-4">
            <button className="hover:text-red-500 transition-colors flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
              <Heart size={24} className="hover:fill-current" />
              <span className="font-medium text-sm">{likes_count || 0}</span>
            </button>
            <button className="hover:text-primary transition-colors flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
              <MessageCircle size={24} />
              <span className="font-medium text-sm">{comments_count || 0}</span>
            </button>
            <button className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
              <Share2 size={24} />
            </button>
          </div>
          <div className="font-bold text-lg text-primary">
            {new Intl.NumberFormat('fr-FR').format(property?.price)} {property?.devise?.code}
          </div>
        </div>

        {/* Content Details */}
        <div className="text-sm">
          <div className="flex items-center space-x-4 mb-2 text-muted-foreground bg-muted/30 p-2 rounded-lg inline-flex">
            <div className="flex items-center font-medium">
              <Expand size={14} className="mr-1.5" />
              {property?.surface} m²
            </div>
            <div className="flex items-center font-medium">
              <BedDouble size={14} className="mr-1.5" />
              {property?.rooms} Pièces
            </div>
          </div>
          
          <p className="line-clamp-2">
            <span className="font-semibold mr-2">{user?.name}</span>
            {property?.name} - {property?.description}
          </p>
          
          {comments_count > 0 && (
             <button className="text-muted-foreground mt-2 text-sm hover:text-foreground hover:underline transition-all">
               Voir les {comments_count} commentaires
             </button>
          )}
        </div>
      </div>
    </div>
  )
}
