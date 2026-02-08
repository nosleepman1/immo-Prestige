import { useQuery } from '@tanstack/react-query'
import { listPosts } from '@/services/social/listPosts'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/store/auth.store'

/**
 * The feed endpoint has no agency filter, so we fetch the public feed and
 * keep only posts for properties owned by the current agency.
 */
export function useMyPosts() {
  const agency = useAuthStore((s) => s.agency)

  return useQuery({
    queryKey: queryKeys.posts.mine,
    queryFn: listPosts,
    enabled: !!agency,
    select: (posts) => posts.filter((post) => post.property?.agency?.id === agency?.id),
  })
}
