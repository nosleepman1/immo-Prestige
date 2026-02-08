export const queryKeys = {
  me: ['me'] as const,
  agencies: {
    list: (status?: string) => ['agencies', 'list', status ?? 'all'] as const,
    detail: (id: number) => ['agencies', 'detail', id] as const,
  },
  reports: {
    list: (status?: string) => ['reports', 'list', status ?? 'all'] as const,
  },
  health: ['health'] as const,
}
