import { useQuery } from '@tanstack/react-query'
import { listPropertyTypes, listDevises } from '@/services/properties/listReferenceData'

export function usePropertyTypes() {
  return useQuery({ queryKey: ['property-types'], queryFn: listPropertyTypes, staleTime: Infinity })
}

export function useDevises() {
  return useQuery({ queryKey: ['devises'], queryFn: listDevises, staleTime: Infinity })
}
