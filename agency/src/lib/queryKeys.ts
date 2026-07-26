import type { RentalApplicationStatus } from '@/types/rental'

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
  owners: {
    list: ['owners'] as const,
    detail: (id: number) => ['owners', 'detail', id] as const,
  },
  rentalApplications: {
    list: (status?: RentalApplicationStatus) =>
      ['rental-applications', { status: status ?? null }] as const,
    detail: (id: number) => ['rental-applications', 'detail', id] as const,
  },
  contractTemplates: {
    list: ['contract-templates'] as const,
    detail: (id: number) => ['contract-templates', 'detail', id] as const,
    variables: ['contract-variables'] as const,
  },
  leases: {
    list: (status?: string) => ['leases', { status: status ?? null }] as const,
    detail: (id: number) => ['leases', 'detail', id] as const,
    installments: (leaseId: number) => ['leases', leaseId, 'installments'] as const,
  },
  installments: {
    ledger: (filters: object) => ['installments', 'ledger', filters] as const,
  },
  notifications: ['notifications'] as const,
}
