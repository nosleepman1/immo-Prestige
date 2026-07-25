export interface Plan {
  id: number
  name: string
  slug: string
  price: number
  currency: 'XOF'
  billing_period_months: number
  property_quota: number | null
  featured_quota: number
}

export type SubscriptionStatus = 'trialing' | 'active' | 'expired' | 'cancelled'

export interface Subscription {
  id: number
  status: SubscriptionStatus
  is_active: boolean
  plan: Plan | null
  price_snapshot: number | null
  quota_snapshot: Record<string, unknown> | null
  trial_ends_at: string | null
  starts_at: string | null
  ends_at: string | null
}

export interface CheckoutResult {
  payment_id: number
  redirect_url: string
}
