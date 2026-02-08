import API from '@/api/api'
import type { Comment, CommentReply } from '@/types/social'

export async function listComments(postId: number): Promise<Comment[]> {
  const { data } = await API.get<{ data: Comment[] }>(`/posts/${postId}/comments`)
  return data.data
}

export async function createComment(postId: number, content: string): Promise<Comment> {
  const { data } = await API.post<{ data: Comment }>(`/posts/${postId}/comments`, { content })
  return data.data
}

export async function deleteComment(commentId: number): Promise<void> {
  await API.delete(`/comments/${commentId}`)
}

export async function createReply(commentId: number, content: string): Promise<CommentReply> {
  const { data } = await API.post<{ data: CommentReply }>(`/comments/${commentId}/replies`, { content })
  return data.data
}

export async function deleteReply(replyId: number): Promise<void> {
  await API.delete(`/comment-replies/${replyId}`)
}
