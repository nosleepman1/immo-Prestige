export type TransactionType = 'sale' | 'rent' | 'both'

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

export interface Property {
  id: number
  property_type: PropertyType | null
  agency: PublicAgency | null
  devise: Devise | null
  status: 'draft' | 'published' | 'archived'
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
}

export interface PropertySearchFilters {
  country?: string
  region?: string
  city?: string
  property_type_id?: number
  transaction_type?: TransactionType
  availability?: PropertyAvailability
  price_min?: number
  price_max?: number
  rooms?: number
  bedrooms?: number
  furnished?: boolean
}

export const AVAILABILITY_LABELS: Record<PropertyAvailability, string> = {
  available: 'Disponible',
  reserved: 'Réservé',
  sold: 'Vendu',
  rented: 'Loué',
}

/**
 * The figure a card leads with. A rental listing quotes what the tenant
 * actually pays each month, charges included — the bare rent would understate
 * the real cost.
 */
export function headlinePrice(
  property: Pick<Property, 'sale' | 'rental'> | null | undefined
): { amount: number; suffix: string } | null {
  if (!property) return null
  if (property.sale) return { amount: property.sale.price, suffix: '' }
  if (property.rental) return { amount: property.rental.monthly_total, suffix: ' / mois' }
  return null
}

export function isRentable(property: Pick<Property, 'transaction_type'>): boolean {
  return property.transaction_type !== 'sale'
}
