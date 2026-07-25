export const queryKeys = {
  me: ['me'] as const,
  properties: {
    mine: ['properties', 'mine'] as const,
    detail: (id: number) => ['properties', 'detail', id] as const,
  },
  plans: ['plans'] as const,
  subscription: ['subscription'] as const,
  posts: {
    mine: ['posts', 'mine'] as const,
    comments: (postId: number) => ['posts', postId, 'comments'] as const,
  },
  conversations: {
    list: ['conversations'] as const,
    messages: (conversationId: number) => ['conversations', conversationId, 'messages'] as const,
  },
}
