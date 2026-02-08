import { useQuery } from '@tanstack/react-query'
import { listPlans } from '@/services/subscriptions/listPlans'
import { queryKeys } from '@/lib/queryKeys'

export function usePlans() {
  return useQuery({ queryKey: queryKeys.plans, queryFn: listPlans })
}
