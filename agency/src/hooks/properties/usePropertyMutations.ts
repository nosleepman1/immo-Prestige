import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { createProperty } from '@/services/properties/createProperty'
import { updateProperty } from '@/services/properties/updateProperty'
import { deleteProperty } from '@/services/properties/deleteProperty'
import { publishProperty } from '@/services/properties/publishProperty'
import { queryKeys } from '@/lib/queryKeys'
import { apiErrorMessage } from '@/lib/apiError'
import type { PropertyFormValues } from '@/types/property'

export function useCreateProperty() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: PropertyFormValues) => createProperty(payload),
    onSuccess: (property) => {
      toast.success('Bien créé en brouillon.')
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.mine })
      navigate(`/properties/${property.id}`)
    },
    // Surface what the server refused: "un bien mis en location doit porter un
    // loyer" tells the agency what to fix, "impossible" does not.
    onError: (error) => toast.error(apiErrorMessage(error, 'Impossible de créer ce bien.')),
  })
}

export function useUpdateProperty(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<PropertyFormValues>) => updateProperty(id, payload),
    onSuccess: () => {
      toast.success('Bien mis à jour.')
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.mine })
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(id) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Impossible de mettre à jour ce bien.')),
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteProperty(id),
    onSuccess: () => {
      toast.success('Bien supprimé.')
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.mine })
    },
    onError: () => toast.error('Impossible de supprimer ce bien.'),
  })
}

export function usePublishProperty(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => publishProperty(id),
    onSuccess: () => {
      toast.success('Bien publié sur le fil d\'actualité.')
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.mine })
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(id) })
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
      if (axiosError.response?.status === 402) {
        toast.error('Abonnement inactif — souscrivez un plan pour publier.')
      } else if (axiosError.response?.status === 409) {
        toast.error('Quota de biens atteint pour votre plan.')
      } else {
        toast.error(axiosError.response?.data?.message ?? 'Publication impossible (fiche incomplète ?).')
      }
    },
  })
}
