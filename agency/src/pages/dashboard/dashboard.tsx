import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Building2, CreditCard, MessageSquare, ShieldCheck } from 'lucide-react'
import { useMyAgency } from '@/hooks/agency/useMyAgency'
import { useResubmitAgency } from '@/hooks/agency/useResubmitAgency'
import { useCurrentSubscription } from '@/hooks/subscriptions/useCurrentSubscription'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import type { ResubmitAgencyPayload } from '@/services/agency/resubmitAgency'

const Dashboard = () => {
  const { data: agency, isLoading } = useMyAgency()
  const subscription = useCurrentSubscription()

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!agency) return null

  if (agency.status !== 'accepted') {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Statut du dossier :{' '}
              <Badge variant={agency.status === 'refused' ? 'destructive' : 'secondary'}>{agency.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {agency.status === 'pending' && <p>Votre dossier est en cours d'examen par un administrateur.</p>}
            {agency.status === 'refused' && (
              <>
                <p>Motif du refus : {agency.refusal_reason}</p>
                <ResubmitForm />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bienvenue, {agency.company_name}</h1>
        <p className="text-muted-foreground text-sm">Tableau de bord de votre agence</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/properties">
          <Card className="hover:ring-primary/40 transition-colors">
            <CardHeader className="flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mes biens</CardTitle>
              <Building2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-sm">Gérer le catalogue</CardContent>
          </Card>
        </Link>

        <Link to="/subscription">
          <Card className="hover:ring-primary/40 transition-colors">
            <CardHeader className="flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Abonnement</CardTitle>
              <CreditCard className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {subscription.data ? (
                <Badge variant={subscription.data.is_active ? 'default' : 'secondary'}>{subscription.data.status}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">Aucun</span>
              )}
              {agency.is_verified && (
                <Badge variant="outline" className="ml-2">
                  <ShieldCheck className="size-3 mr-1" /> Vérifiée
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/messages">
          <Card className="hover:ring-primary/40 transition-colors">
            <CardHeader className="flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Messagerie</CardTitle>
              <MessageSquare className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-sm">Voir les conversations</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function ResubmitForm() {
  const resubmit = useResubmitAgency()
  const { register, handleSubmit } = useForm<ResubmitAgencyPayload>()

  return (
    <form
      onSubmit={handleSubmit((values) => resubmit.mutate(values))}
      className="space-y-2 pt-2 border-t"
    >
      <Label className="text-foreground">Mettre à jour et redéposer le dossier</Label>
      <Textarea placeholder="Nouvelle description (optionnel)" rows={3} {...register('description')} />
      <Button type="submit" disabled={resubmit.isPending} size="sm">
        Redéposer le dossier
      </Button>
    </form>
  )
}

export default Dashboard
