export type PropertyStatus = 'draft' | 'published' | 'archived'

/** What the listing is offered for. Drives which details block is present. */
export type TransactionType = 'sale' | 'rent' | 'both'

/** Commercial availability, successor of the former `sold` boolean. */
export type PropertyAvailability = 'available' | 'reserved' | 'sold' | 'rented'

export interface PropertyType {
  id: number
  name: string
}

export interface Devise {
  id: number
  name: string
  code: string
}

export interface PropertyImage {
  id: number
  url: string
  is_cover: boolean
  position: number
}

export interface PublicAgency {
  id: number
  company_name: string
  city: string
  is_verified: boolean
}

export interface PropertySaleDetail {
  price: number
  negotiable: boolean
}

export interface PropertyRentalDetail {
  rent_amount: number
  charges_amount: number
  deposit_amount: number
  advance_months: number
  min_lease_months: number
  available_from: string | null
  /** Computed server-side so the three clients cannot drift apart. */
  monthly_total: number
  move_in_cost: number
}

export interface PropertyOwner {
  id: number
  full_name: string
  phone: string
}

export interface Property {
  id: number
  property_type: PropertyType | null
  agency: PublicAgency | null
  devise: Devise | null
  status: PropertyStatus
  transaction_type: TransactionType
  availability: PropertyAvailability
  name: string
  description: string | null
  surface: number
  rooms: number
  bedrooms: number | null
  floor: number | null
  furnished: boolean
  country: string
  region: string
  city: string
  longitude: number | null
  latitude: number | null
  created_at: string
  updated_at: string
  images: PropertyImage[]
  /** Present only for the side the listing is actually offered on. */
  sale?: PropertySaleDetail
  rental?: PropertyRentalDetail
  /** Agency-internal: absent from the public listing. */
  owner?: PropertyOwner
}

export interface PropertyFormValues {
  property_type_id: number
  devise_id: number
  owner_id?: number | null
  transaction_type: TransactionType
  name: string
  description?: string
  surface: number
  rooms: number
  bedrooms?: number
  floor?: number
  furnished?: boolean
  country: string
  region: string
  city: string
  longitude?: number
  latitude?: number
  sale?: { price: number; negotiable?: boolean }
  rental?: {
    rent_amount: number
    charges_amount?: number
    deposit_amount?: number
    advance_months?: number
    min_lease_months?: number
    available_from?: string
  }
}

export const TRANSACTION_LABELS: Record<TransactionType, string> = {
  sale: 'Vente',
  rent: 'Location',
  both: 'Vente et location',
}

export const AVAILABILITY_LABELS: Record<PropertyAvailability, string> = {
  available: 'Disponible',
  reserved: 'Réservé',
  sold: 'Vendu',
  rented: 'Loué',
}

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

/**
 * The figure a listing card leads with. A property offered both ways shows its
 * sale price; a rental one shows what the tenant actually pays each month,
 * charges included — quoting the bare rent would understate the real cost.
 */
export function headlinePrice(property: Property): { amount: number; suffix: string } | null {
  if (property.sale) return { amount: property.sale.price, suffix: '' }
  if (property.rental) return { amount: property.rental.monthly_total, suffix: ' / mois' }
  return null
}
