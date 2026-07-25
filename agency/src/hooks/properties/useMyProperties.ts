import { useQuery } from '@tanstack/react-query'
import { listMyProperties } from '@/services/properties/listMyProperties'
import { queryKeys } from '@/lib/queryKeys'

export function useMyProperties() {
  return useQuery({
    queryKey: queryKeys.properties.mine,
    queryFn: listMyProperties,
  })
}
