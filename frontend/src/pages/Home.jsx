import React, { useState } from 'react'
import PostCard from '@/components/posts/PostCard'
import useGetPosts from '@/hooks/post/useGetPosts'
import CostumLoader from '@/components/Loader'

export default function Home() {

  const [page, setPage] = useState(1)
  const {posts, loading, error} = useGetPosts(page)



  return (
    <div className='bg-background min-h-screen pb-20'>

      {/* Header Optionnel pour le feed Instagram-like */}
      <div className='sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border py-3 px-4 flex justify-between items-center mb-6 shadow-sm'>
        <h1 className='text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>Immo Prestige</h1>
      </div>

      <div className='max-w-xl mx-auto px-4 sm:px-0 flex flex-col items-center gap-6'>
        {loading ? (
           <div className="mt-10"><CostumLoader /></div>
        ) : (
        
          posts?.data?.map(post => (
              <PostCard key={post.id} post={post} />
          ))
        )}

        {/* Bouton Voir Plus */}
        {posts?.meta?.last_page > page && (
          <button 
             onClick={() => setPage(page + 1)} 
             className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition shadow-sm font-medium"
          >
            Afficher plus
          </button>
        )}
      </div>
        
    </div>
  )
}
