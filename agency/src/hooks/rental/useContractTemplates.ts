import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createClause,
  createContractTemplate,
  deleteClause,
  deleteContractTemplate,
  getContractTemplate,
  listContractTemplates,
  listContractVariables,
  reorderClauses,
  updateClause,
  updateContractTemplate,
} from '@/services/rental/contractTemplates'
import { queryKeys } from '@/lib/queryKeys'

export function useContractTemplates() {
  return useQuery({ queryKey: queryKeys.contractTemplates.list, queryFn: listContractTemplates })
}

export function useContractTemplate(id: number) {
  return useQuery({
    queryKey: queryKeys.contractTemplates.detail(id),
    queryFn: () => getContractTemplate(id),
    enabled: Number.isFinite(id),
  })
}

/** Published by the API so the editor offers them instead of leaving them to be guessed. */
export function useContractVariables() {
  return useQuery({
    queryKey: queryKeys.contractTemplates.variables,
    queryFn: listContractVariables,
    staleTime: Infinity,
  })
}

export function useTemplateMutations(templateId?: number) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.contractTemplates.list })
    if (templateId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.contractTemplates.detail(templateId) })
    }
  }

  return {
    create: useMutation({ mutationFn: createContractTemplate, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...payload }: { id: number; name?: string; is_default?: boolean }) =>
        updateContractTemplate(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: deleteContractTemplate, onSuccess: invalidate }),
    addClause: useMutation({
      mutationFn: (payload: { title: string; body: string; is_required?: boolean }) =>
        createClause(templateId!, payload),
      onSuccess: invalidate,
    }),
    editClause: useMutation({
      mutationFn: ({ id, ...payload }: { id: number; title?: string; body?: string }) =>
        updateClause(id, payload),
      onSuccess: invalidate,
    }),
    removeClause: useMutation({ mutationFn: deleteClause, onSuccess: invalidate }),
    reorder: useMutation({
      mutationFn: (ids: number[]) => reorderClauses(templateId!, ids),
      onSuccess: invalidate,
    }),
  }
}
