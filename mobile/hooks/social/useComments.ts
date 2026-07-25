import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listComments,
  createComment,
  deleteComment,
  createReply,
  deleteReply,
} from '@/services/social/comments'
import { queryKeys } from '@/lib/queryKeys'

export function useComments(postId: number) {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: () => listComments(postId),
    enabled: Number.isFinite(postId),
  })
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => createComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed })
    },
  })
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed })
    },
  })
}

export function useCreateReply(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) => createReply(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) })
    },
  })
}

export function useDeleteReply(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (replyId: number) => deleteReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) })
    },
  })
}
