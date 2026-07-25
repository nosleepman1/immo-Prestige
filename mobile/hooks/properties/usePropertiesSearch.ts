import { useInfiniteQuery } from '@tanstack/react-query'
import { searchProperties } from '@/services/properties/searchProperties'
import { queryKeys } from '@/lib/queryKeys'
import type { PropertySearchFilters } from '@/types/property'

export function usePropertiesSearch(filters: PropertySearchFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.properties.search(filters),
    queryFn: ({ pageParam }) => searchProperties(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined
      return lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined
    },
  })
}
