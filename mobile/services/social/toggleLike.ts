import API from '@/api/api'

export interface ToggleLikeResult {
  liked: boolean
}

export async function toggleLike(postId: number): Promise<ToggleLikeResult> {
  const { data } = await API.post<{ data: ToggleLikeResult }>(`/posts/${postId}/like`)
  return data.data
}
