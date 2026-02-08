import { useQuery } from '@tanstack/react-query'
import { getProperty } from '@/services/properties/getProperty'
import { queryKeys } from '@/lib/queryKeys'

export function useProperty(id: number) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => getProperty(id),
    enabled: Number.isFinite(id),
  })
}
