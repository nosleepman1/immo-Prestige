import { useInfiniteQuery } from '@tanstack/react-query'
import { listPosts } from '@/services/social/listPosts'
import { queryKeys } from '@/lib/queryKeys'

export function usePostsFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.feed,
    queryFn: ({ pageParam }) => listPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined
      return lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined
    },
  })
}
