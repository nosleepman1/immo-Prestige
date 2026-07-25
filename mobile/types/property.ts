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

export interface Property {
  id: number
  property_type: PropertyType | null
  agency: PublicAgency | null
  devise: Devise | null
  status: 'draft' | 'published' | 'archived'
  name: string
  description: string | null
  surface: number
  rooms: number
  bedrooms: number | null
  floor: number | null
  furnished: boolean
  price: number
  country: string
  region: string
  city: string
  longitude: number | null
  latitude: number | null
  sold: boolean
  created_at: string
  updated_at: string
  images: PropertyImage[]
}

export interface PropertySearchFilters {
  country?: string
  region?: string
  city?: string
  property_type_id?: number
  price_min?: number
  price_max?: number
  rooms?: number
  bedrooms?: number
  sold?: boolean
}
