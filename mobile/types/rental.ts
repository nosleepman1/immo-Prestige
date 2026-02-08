import type { Property } from './property'

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
  property?: Property
  documents?: RentalApplicationDocument[]
  documents_count?: number
}

export interface RentalApplicationPayload {
  property_id: number
  desired_start_date: string
  desired_duration_months: number
  message?: string
}

export type LeaseStatus =
  | 'draft'
  | 'pending_validation'
  | 'pending_signature'
  | 'pending_payment'
  | 'active'
  | 'terminated'
  | 'expired'
  | 'cancelled'

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
  payment_day: number
  notice_period_days: number
  has_generated_contract: boolean
  has_signed_contract: boolean
  signed_at: string | null
  signature_rejection_reason: string | null
  property?: Property
  created_at: string
}

export type InstallmentStatus = 'pending' | 'partially_paid' | 'paid' | 'late' | 'cancelled'

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
  /** Derived server-side: never recompute it on the device. */
  remaining_due: number
  status: InstallmentStatus
  status_label: string
  paid_at: string | null
  has_receipt: boolean
}

export interface AppNotification {
  id: string
  key: string | null
  title: string | null
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

/** Mirrors the backend RentalDocumentType enum. */
export type RentalDocumentType =
  | 'identity_document'
  | 'proof_of_income'
  | 'employment_letter'
  | 'other'

export const DOCUMENT_TYPE_LABELS: Record<RentalDocumentType, string> = {
  identity_document: "Pièce d'identité",
  proof_of_income: 'Justificatif de revenus',
  employment_letter: 'Attestation de travail',
  other: 'Autre document',
}
