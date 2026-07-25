import API from '@/api/api'
import type { Comment } from '@/types/social'

export async function listComments(postId: number): Promise<Comment[]> {
  const { data } = await API.get<{ data: Comment[] }>(`/posts/${postId}/comments`)
  return data.data
}
