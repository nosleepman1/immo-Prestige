import { useQuery } from '@tanstack/react-query'
import { listComments } from '@/services/social/listComments'
import { queryKeys } from '@/lib/queryKeys'

export function usePostComments(postId: number) {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: () => listComments(postId),
    enabled: Number.isFinite(postId),
  })
}
