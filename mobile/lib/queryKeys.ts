export const queryKeys = {
  me: ['me'] as const,
  posts: {
    feed: ['posts', 'feed'] as const,
    detail: (id: number) => ['posts', 'detail', id] as const,
    comments: (postId: number) => ['posts', postId, 'comments'] as const,
  },
  properties: {
    search: (filters: unknown) => ['properties', 'search', filters] as const,
    detail: (id: number) => ['properties', 'detail', id] as const,
  },
  conversations: {
    list: ['conversations'] as const,
    messages: (conversationId: number) => ['conversations', conversationId, 'messages'] as const,
  },
  rentalApplications: {
    mine: ['rental-applications', 'mine'] as const,
    detail: (id: number) => ['rental-applications', 'detail', id] as const,
  },
  leases: {
    mine: ['leases', 'mine'] as const,
    detail: (id: number) => ['leases', 'detail', id] as const,
    installments: (leaseId: number) => ['leases', leaseId, 'installments'] as const,
  },
  notifications: ['notifications'] as const,
}
