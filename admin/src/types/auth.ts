// ─── User & role ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'agency' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

// ─── Agency (own record shape, mirrors AgencyResource) ───────────────────────

export type AgencyStatus = 'pending' | 'accepted' | 'refused'

export interface AgencyDocument {
  id: number
  type: 'id_card' | 'business_registry' | 'proof_of_address' | 'other'
  original_name: string
  url: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Agency {
  id: number
  company_name: string
  manager_name: string
  description: string
  address: string
  city: string
  activity_zone: string | null
  phone: string
  id_card: string
  status: AgencyStatus
  is_verified: boolean
  verified_until: string | null
  refusal_reason: string | null
  activated_at: string | null
  user_id: number
  documents?: AgencyDocument[]
  created_at: string
  updated_at: string
}

// ─── Auth requests/responses (real backend contract, /auth/*) ───────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResult {
  user: User
  agency: Agency | null
  token: string
}

export interface MeResult {
  user: User
  agency: Agency | null
}

export interface ApiErrorPayload {
  message: string
  errors?: Record<string, string[]>
}
