import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MapPin, Building, BedDouble, Expand, X, Send } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import useToggleLike from '@/hooks/post/useToggleLike'
import useComments from '@/hooks/post/useComments'

export default function PostCard({ post }) {
  const { id: postId, property, user, likes_count, comments_count, created_at, is_liked_by_user } = post
  
  const [localLiked, setLocalLiked] = useState(is_liked_by_user || false)
  const [localLikesCount, setLocalLikesCount] = useState(likes_count || 0)
  const [localCommentsCount, setLocalCommentsCount] = useState(comments_count || 0)
  
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  
  const { toggleLike, loading: liking } = useToggleLike()
  const { comments, getComments, addComment, loading: commentsLoading, addingComment } = useComments(postId)
  
  const navigate = useNavigate()

  useEffect(() => {
    // Ne fetch que si le modal s'ouvre pour la première fois
    if (isCommentsOpen && comments.length === 0 && localCommentsCount > 0) {
      getComments()
    }
  }, [isCommentsOpen])

  const handleLike = async () => {
    // Optimistic Update pour une interface fluide
    const prevLiked = localLiked
    const prevCount = localLikesCount
    setLocalLiked(!prevLiked)
    setLocalLikesCount(prevLiked ? prevCount - 1 : prevCount + 1)
    
    const res = await toggleLike(postId)
    
    if (res.error === 'unauthenticated') {
      // Annuler optimistic update et rediriger
      setLocalLiked(prevLiked)
      setLocalLikesCount(prevCount)
      navigate('/login')
      return
    }
    if (!res.success) {
      // Revert in case of backend failure
      setLocalLiked(prevLiked)
      setLocalLikesCount(prevCount)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    
    const res = await addComment(commentText)
    if (res.error === 'unauthenticated') {
      navigate('/login')
      return
    }
    if (res.success) {
      setCommentText('')
      setLocalCommentsCount(prev => prev + 1)
    }
  }

  const coverImage = property?.images?.find(img => img.is_cover)?.image_path || property?.images?.[0]?.image_path || 'https://placehold.co/600x400?text=No+Image'
  
  const formattedDate = created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr }) : ''

  return (
    <>
      <div className="bg-card text-card-foreground border border-border sm:rounded-xl overflow-hidden shadow-sm mb-6 max-w-lg mx-auto w-full transition-colors duration-200 relative">
        
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
              {/* Like Button */}
              <button 
                onClick={handleLike}
                disabled={liking}
                className={`transition-colors flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md ${localLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <Heart size={24} className={localLiked ? 'fill-current text-red-500' : ''} />
                <span className="font-medium text-sm text-foreground">{localLikesCount || 0}</span>
              </button>
              
              {/* Comment Button */}
              <button 
                onClick={() => setIsCommentsOpen(true)}
                className="hover:text-primary transition-colors flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              >
                <MessageCircle size={24} />
                <span className="font-medium text-sm">{localCommentsCount || 0}</span>
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
            
            {(localCommentsCount > 0 || comments.length > 0) && (
              <button 
                onClick={() => setIsCommentsOpen(true)}
                className="text-muted-foreground mt-2 text-sm hover:text-foreground hover:underline transition-all"
              >
                Voir les {localCommentsCount} commentaires
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 
        ========================================
        BOTTOM SHEET DRAWER (Instagram Style) 
        ========================================
      */}
      <AnimatePresence>
        {isCommentsOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end mx-auto max-w-lg">
            {/* Backdrop transparent pour fermer en cliquant à côté */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommentsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Le volet glissant */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-[65vh] sm:h-[75vh] bg-card text-card-foreground rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drag handle (purement visuel ici pour l'esthétique) */}
              <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setIsCommentsOpen(false)}>
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>
              
              <div className="flex justify-between items-center px-4 pb-3 border-b border-border">
                <h3 className="font-bold text-lg text-center flex-1">Commentaires</h3>
                <button onClick={() => setIsCommentsOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors absolute right-4">
                  <X size={20} />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-border">
                {commentsLoading ? (
                  <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-muted-foreground pt-10">
                    <MessageCircle size={32} className="mx-auto mb-3 opacity-20" />
                    Aucun commentaire pour l'instant.<br/>Soyez le premier !
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                        {c.user?.name ? c.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{c.user?.name || 'Utilisateur'}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-foreground/90">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="p-3 border-t border-border bg-card">
                <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 border border-border focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                  <input 
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 bg-transparent border-none outline-none text-sm py-1"
                  />
                  <button 
                    type="submit"
                    disabled={!commentText.trim() || addingComment}
                    className="text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-transform p-1"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
