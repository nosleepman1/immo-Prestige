import { usePlans } from '@/hooks/subscriptions/usePlans'
import { useCurrentSubscription } from '@/hooks/subscriptions/useCurrentSubscription'
import { useCheckoutSubscription, useCheckoutBadge } from '@/hooks/subscriptions/useCheckout'
import { useMyAgency } from '@/hooks/agency/useMyAgency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ShieldCheck } from 'lucide-react'

const SubscriptionPage = () => {
  const plans = usePlans()
  const subscription = useCurrentSubscription()
  const { data: agency } = useMyAgency()
  const checkoutSubscription = useCheckoutSubscription()
  const checkoutBadge = useCheckoutBadge()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Abonnement</h1>
        <p className="text-muted-foreground text-sm">Choisissez la formule adaptée à votre activité</p>
      </div>

      {subscription.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Abonnement actuel</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm">
            <Badge variant={subscription.data.is_active ? 'default' : 'secondary'}>{subscription.data.status}</Badge>
            {subscription.data.plan && <span>{subscription.data.plan.name}</span>}
            {subscription.data.trial_ends_at && (
              <span className="text-muted-foreground">
                Essai jusqu'au {new Date(subscription.data.trial_ends_at).toLocaleDateString('fr-FR')}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {plans.isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.data?.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 flex-1">
                <div className="text-2xl font-semibold">
                  {new Intl.NumberFormat('fr-FR').format(plan.price)} {plan.currency}
                </div>
                <div className="text-sm text-muted-foreground">
                  {plan.billing_period_months} mois — {plan.property_quota ?? 'Illimité'} biens
                </div>
                <Button
                  className="mt-auto"
                  onClick={() => checkoutSubscription.mutate(plan.id)}
                  disabled={checkoutSubscription.isPending}
                >
                  Souscrire
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="size-4" /> Badge de compte vérifié
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm">
          {agency?.is_verified ? (
            <Badge>Badge actif</Badge>
          ) : (
            <>
              <p className="text-muted-foreground">
                Rassurez vos clients avec le badge vérifié (paiement direct, sans validation administrative).
              </p>
              <Button variant="outline" onClick={() => checkoutBadge.mutate()} disabled={checkoutBadge.isPending}>
                Acheter le badge
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SubscriptionPage
