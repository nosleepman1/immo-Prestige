import API from '@/api/api'
import type { Post } from '@/types/social'

export interface PostsPage {
  data: Post[]
  meta?: { current_page: number; last_page: number }
}

export async function listPosts(page = 1): Promise<PostsPage> {
  const { data } = await API.get<PostsPage>('/posts', { params: { page } })
  return data
}
