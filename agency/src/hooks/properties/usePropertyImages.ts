import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadPropertyImage } from '@/services/properties/uploadPropertyImage'
import { setCoverPropertyImage } from '@/services/properties/setCoverPropertyImage'
import { deletePropertyImage } from '@/services/properties/deletePropertyImage'
import { reorderPropertyImages } from '@/services/properties/reorderPropertyImages'
import { queryKeys } from '@/lib/queryKeys'

export function useUploadPropertyImage(propertyId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadPropertyImage(propertyId, file),
    onSuccess: () => {
      toast.success('Image ajoutée.')
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(propertyId) })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Impossible d\'ajouter cette image (format ou taille non supporté).'
      toast.error(msg)
    },
  })
}

export function useSetCoverImage(propertyId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: number) => setCoverPropertyImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(propertyId) })
    },
    onError: () => toast.error('Impossible de définir cette image comme couverture.'),
  })
}

export function useDeletePropertyImage(propertyId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: number) => deletePropertyImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(propertyId) })
    },
    onError: () => toast.error('Impossible de supprimer cette image.'),
  })
}

export function useReorderPropertyImages(propertyId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageIds: number[]) => reorderPropertyImages(propertyId, imageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(propertyId) })
    },
    onError: () => toast.error('Impossible de réordonner les images.'),
  })
}
