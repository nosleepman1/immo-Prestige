import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { checkoutSubscription } from '@/services/subscriptions/checkoutSubscription'
import { checkoutBadge } from '@/services/subscriptions/checkoutBadge'

/** PayDunya hosts the actual payment page — we redirect the whole tab there. */
export function useCheckoutSubscription() {
  return useMutation({
    mutationFn: (planId: number) => checkoutSubscription(planId),
    onSuccess: (result) => {
      window.location.href = result.redirect_url
    },
    onError: () => toast.error('Impossible de démarrer le paiement.'),
  })
}

export function useCheckoutBadge() {
  return useMutation({
    mutationFn: () => checkoutBadge(),
    onSuccess: (result) => {
      window.location.href = result.redirect_url
    },
    onError: () => toast.error('Impossible de démarrer le paiement du badge.'),
  })
}
