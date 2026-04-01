import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MapPin, Building, BedDouble, Expand, X, Send } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { LuSend } from "react-icons/lu";
import useToggleLike from '@/hooks/post/useToggleLike'
import useComments from '@/hooks/post/useComments'
import { en } from 'zod/v4/locales'

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
    
    if (isCommentsOpen && comments.length === 0 && localCommentsCount > 0) {
      getComments()
    }
  }, [isCommentsOpen])

  const handleLike = async () => {
    const prevLiked = localLiked
    const prevCount = localLikesCount
    setLocalLiked(!prevLiked)
    setLocalLikesCount(prevLiked ? prevCount - 1 : prevCount + 1)
    
    const res = await toggleLike(postId)
    
    if (res.error === 'unauthenticated') {
      setLocalLiked(prevLiked)
      setLocalLikesCount(prevCount)
      navigate('/login')
      return
    }
    
    if (!res.success) {
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
  
  const formattedDate = created_at ? formatDistanceToNow(new Date(created_at), { locale: fr }) : ''

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
        <Link to={`/`}>
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
         {/* Backdrop sombre mais SANS blur comme demandé */}


        <AnimatePresence>
        {isCommentsOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end mx-auto max-w-lg">
           
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommentsOpen(false)}
              className="absolute inset-0 bg-black/50"
            />

            {/* Le volet glissant aux coins fortement arrondis */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full h-[70vh] bg-background text-foreground rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Entête avec la petite barre et le titre Comments */}
              <div className="flex flex-col items-center pt-3 pb-4 border-b border-border relative">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mb-3" />
                <h3 className="font-bold text-[15px]">Comments</h3>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
                {commentsLoading ? (
                  <div className="flex justify-center p-4"><div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-muted-foreground pt-10 text-sm">
                    No comments yet.<br/>Be the first to comment!
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex space-x-3 group relative">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border border-border">
                        {c.user?.name ? c.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      
                      {/* Comment Body */}
                      <div className="flex-1 text-[14px]">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-foreground">{c.user?.name || 'user'}</span>
                          <span className="text-muted-foreground text-[13px]">
                            {/* Simplifié pour simuler le '2w', date-fns génèrerait '2 sem.' */}
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: false, locale: fr }).replace('environ', '').trim()}
                          </span>
                        </div>
                        <p className="mt-0.5 text-foreground/90">{c.content}</p>
                        <div className="flex items-center space-x-4 mt-2 text-[12px] font-semibold text-muted-foreground">
                          <button className="hover:text-foreground transition-colors">Reply</button>
                        </div>
                      </div>

                      {/* Right side Like icon */}
                      <div className="flex flex-col items-center ml-2 space-y-1">
                        <button className="text-muted-foreground hover:text-red-500 transition-colors">
                          <Heart size={14} className="stroke-[2.5]" />
                        </button>
                        {/* Fake likes count for UI purposes to match Instagram UI */}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input Footer */}
              <div className="p-3 border-t border-border bg-background">
                
                <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3">
                  <div className="flex-1 flex items-center bg-muted/50 border border-input rounded-full px-4 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <input 
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="What do you think of this?"
                      className="flex-1 bg-transparent border-none outline-none text-[14px] text-foreground placeholder:-muted-foreground"
                    />
                    <button 
                      type="submit"
                      disabled={!commentText.trim() || addingComment}
                      className={`text-primary font-semibold text-[14px] transition-opacity ml-2 ${(!commentText.trim() || addingComment) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                      <LuSend size={20} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
