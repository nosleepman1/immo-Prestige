import type { Property } from './property'

// ---------------------------------------------------------------------------
// Owners
// ---------------------------------------------------------------------------

export interface Owner {
  id: number
  last_name: string
  first_name: string | null
  full_name: string
  phone: string
  email: string | null
  address: string | null
  id_document_number: string | null
  notes: string | null
  has_account: boolean
  properties_count?: number
  created_at: string
  updated_at: string
}

export interface OwnerFormValues {
  last_name: string
  first_name?: string
  phone: string
  email?: string
  address?: string
  id_document_number?: string
  notes?: string
}

// ---------------------------------------------------------------------------
// Rental applications
// ---------------------------------------------------------------------------

export type RentalApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'documents_requested'
  | 'accepted'
  | 'rejected'
  | 'cancelled'

export const APPLICATION_STATUS_LABELS: Record<RentalApplicationStatus, string> = {
  submitted: 'Déposée',
  under_review: 'En instruction',
  documents_requested: 'Pièces demandées',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
}

export interface RentalApplicationDocument {
  id: number
  type: string
  type_label: string
  original_name: string
  size_bytes: number
  mime_type: string
  download_url: string
  created_at: string
}

export interface RentalApplication {
  id: number
  status: RentalApplicationStatus
  desired_start_date: string
  desired_duration_months: number
  message: string | null
  rejection_reason: string | null
  requested_documents: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  property?: Property
  applicant?: { id: number; name: string; email: string }
  documents?: RentalApplicationDocument[]
  documents_count?: number
}

/** Only these three still accept a decision from the agency. */
export function isOpenToReview(status: RentalApplicationStatus): boolean {
  return status === 'submitted' || status === 'under_review' || status === 'documents_requested'
}

// ---------------------------------------------------------------------------
// Contract templates
// ---------------------------------------------------------------------------

export interface ContractClause {
  id: number
  position: number
  title: string
  body: string
  is_required: boolean
  created_at: string
  updated_at: string
}

export interface ContractTemplate {
  id: number
  name: string
  is_default: boolean
  clauses?: ContractClause[]
  clauses_count?: number
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Leases
// ---------------------------------------------------------------------------

export type LeaseStatus =
  | 'draft'
  | 'pending_validation'
  | 'pending_signature'
  | 'pending_payment'
  | 'active'
  | 'terminated'
  | 'expired'
  | 'cancelled'

export type LeasePeriodicity = 'monthly' | 'quarterly' | 'biannual' | 'annual'

export interface Lease {
  id: number
  reference: string
  status: LeaseStatus
  status_label: string
  start_date: string
  end_date: string
  duration_months: number
  rent_amount: number
  charges_amount: number
  deposit_amount: number
  advance_months: number
  monthly_total: number
  initial_payment: number
  periodicity: LeasePeriodicity
  payment_day: number
  notice_period_days: number
  has_generated_contract: boolean
  has_signed_contract: boolean
  signed_at: string | null
  signature_rejection_reason: string | null
  validated_at: string | null
  termination_date: string | null
  termination_reason: string | null
  property?: Property
  tenant?: { id: number; name: string; email: string }
  owner?: Owner
  created_at: string
  updated_at: string
}

export interface GenerateLeaseValues {
  contract_template_id?: number
  start_date?: string
  duration_months?: number
  periodicity?: LeasePeriodicity
  payment_day?: number
  notice_period_days?: number
}

// ---------------------------------------------------------------------------
// Instalments
// ---------------------------------------------------------------------------

export type InstallmentStatus = 'pending' | 'partially_paid' | 'paid' | 'late' | 'cancelled'

export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, string> = {
  pending: 'Attendue',
  partially_paid: 'Partiellement réglée',
  paid: 'Réglée',
  late: 'En retard',
  cancelled: 'Annulée',
}

export interface InstallmentImputation {
  payment_id: number
  applied_amount: number
  method: 'paydunya' | 'cash' | null
  validated_at: string | null
  recorded_by: string | null
}

export interface LeaseInstallment {
  id: number
  reference: string
  period_start: string
  period_end: string
  due_date: string
  rent_amount: number
  charges_amount: number
  total_amount: number
  paid_amount: number
  /** Derived server-side: never recompute it in the browser. */
  remaining_due: number
  status: InstallmentStatus
  status_label: string
  paid_at: string | null
  has_receipt: boolean
  imputations?: InstallmentImputation[]
  lease?: Lease
}
