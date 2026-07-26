import API from '@/api/api'
import type { ContractClause, ContractTemplate } from '@/types/rental'

export async function listContractTemplates(): Promise<ContractTemplate[]> {
  const { data } = await API.get<{ data: ContractTemplate[] }>('/agency/contract-templates')
  return data.data
}

export async function getContractTemplate(id: number): Promise<ContractTemplate> {
  const { data } = await API.get<{ data: ContractTemplate }>(`/agency/contract-templates/${id}`)
  return data.data
}

export async function createContractTemplate(payload: {
  name: string
  is_default?: boolean
}): Promise<ContractTemplate> {
  const { data } = await API.post<{ data: ContractTemplate }>('/agency/contract-templates', payload)
  return data.data
}

export async function updateContractTemplate(
  id: number,
  payload: { name?: string; is_default?: boolean }
): Promise<ContractTemplate> {
  const { data } = await API.put<{ data: ContractTemplate }>(
    `/agency/contract-templates/${id}`,
    payload
  )
  return data.data
}

export async function deleteContractTemplate(id: number): Promise<void> {
  await API.delete(`/agency/contract-templates/${id}`)
}

export async function createClause(
  templateId: number,
  payload: { title: string; body: string; is_required?: boolean }
): Promise<ContractClause> {
  const { data } = await API.post<{ data: ContractClause }>(
    `/agency/contract-templates/${templateId}/clauses`,
    payload
  )
  return data.data
}

export async function updateClause(
  clauseId: number,
  payload: { title?: string; body?: string; is_required?: boolean }
): Promise<ContractClause> {
  const { data } = await API.put<{ data: ContractClause }>(`/agency/clauses/${clauseId}`, payload)
  return data.data
}

export async function deleteClause(clauseId: number): Promise<void> {
  await API.delete(`/agency/clauses/${clauseId}`)
}

export async function reorderClauses(templateId: number, ids: number[]): Promise<ContractClause[]> {
  const { data } = await API.put<{ data: ContractClause[] }>(
    `/agency/contract-templates/${templateId}/clauses/order`,
    { ids }
  )
  return data.data
}

/** The vocabulary an agency may use in its clauses, published by the API. */
export async function listContractVariables(): Promise<string[]> {
  const { data } = await API.get<{ data: string[] }>('/agency/contract-variables')
  return data.data
}
