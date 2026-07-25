import API from '@/api/api'
import type { Post } from '@/types/social'

interface PaginatedPosts {
  data: Post[]
  meta?: { current_page: number; last_page: number }
}

/**
 * The feed has no per-agency filter and a fixed page size (15, not
 * client-configurable), so finding "my" posts means walking every page —
 * capped at 10 pages (150 posts) to bound worst-case cost.
 */
export async function listPosts(): Promise<Post[]> {
  const posts: Post[] = []
  let page = 1
  const maxPages = 10

  while (page <= maxPages) {
    const { data } = await API.get<PaginatedPosts>('/posts', { params: { page } })
    posts.push(...data.data)

    if (!data.meta || page >= data.meta.last_page) break
    page += 1
  }

  return posts
}
