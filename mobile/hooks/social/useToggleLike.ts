import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleLike } from '@/services/social/toggleLike'
import { queryKeys } from '@/lib/queryKeys'
import type { PostsPage } from '@/services/social/listPosts'

/** Optimistic toggle: the API only returns {liked}, count is adjusted locally. */
export function useToggleLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: number) => toggleLike(postId),
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.feed })
      const previous = queryClient.getQueryData<{ pages: PostsPage[] }>(queryKeys.posts.feed)

      queryClient.setQueryData<{ pages: PostsPage[]; pageParams: unknown[] } | undefined>(
        queryKeys.posts.feed,
        (data) => {
          if (!data) return data
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              data: page.data.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      is_liked_by_user: !post.is_liked_by_user,
                      likes_count: post.likes_count + (post.is_liked_by_user ? -1 : 1),
                    }
                  : post
              ),
            })),
          }
        }
      )

      return { previous }
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.posts.feed, context.previous)
      }
    },
  })
}
