import React, { useEffect, useRef } from 'react'
import PostCard from '@/components/posts/PostCard'
import useGetPosts from '@/hooks/post/useGetPosts'
import CostumLoader from '@/components/Loader'

export default function Home() {
  const { posts, loading, loadingMore, hasNextPage, fetchNextPage } = useGetPosts()

  // Sentinelle en bas de page
  const sentinelRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
        fetchNextPage()
      }
    }, { threshold: 0.1 })

    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, loadingMore, fetchNextPage])

  return (
    <div className='bg-background min-h-screen '>

      <div className='sticky top-0 z-40  py-3 px-4 flex justify-between items-center mb-6 shadow-sm'>
       
      </div>

      <div className='max-w-xl  px-4 sm:px-0 flex flex-col items-center gap-6'>

        {/* Chargement initial */}
        {loading ? (
          <div className="mt-10 w-full"><CostumLoader /></div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}

        {/* Sentinelle invisible — déclenche le fetch */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {/* Skeleton discret pendant le chargement des pages suivantes */}
        {loadingMore && (
          <div className="w-full flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        

      </div>
    </div>
  )
}