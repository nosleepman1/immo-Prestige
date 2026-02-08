import API from '@/api/api'

export interface AgencyStats {
  counters: {
    properties: number
    applications: number
    pending_applications: number
    active_leases: number
  }
  revenue_chart: {
    month: string
    revenus: number
    baux: number
    demandes: number
  }[]
  property_distribution: {
    name: string
    value: number
    color: string
  }[]
}

export async function getAgencyStats(): Promise<AgencyStats> {
  const { data } = await API.get<{ data: AgencyStats }>('/agency/stats')
  return data.data
}
