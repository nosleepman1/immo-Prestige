import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Download, X } from 'lucide-react'
import { useLease, useLeaseActions, useDocumentOpener } from '@/hooks/rental/useLeases'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import LeaseLedger from './LeaseLedger'

const money = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} XOF`
const date = (value: string) => new Date(value).toLocaleDateString('fr-FR')

const LeaseDetail = () => {
  const { id } = useParams()
  const leaseId = Number(id)

  const { data: lease, isLoading, isError, refetch } = useLease(leaseId)
  const actions = useLeaseActions(leaseId)
  const documents = useDocumentOpener()
  const [refusal, setRefusal] = useState('')

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (isError || !lease) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-muted-foreground text-sm">Ce bail est introuvable.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    )
  }

  // The scan can only be reviewed once it has actually arrived.
  const canReviewSignature = lease.status === 'pending_signature' && lease.has_signed_contract

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      <Link to="/leases" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4 mr-1" /> Retour aux baux
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{lease.reference}</h1>
          <p className="text-muted-foreground text-sm">
            {lease.tenant?.name} — {lease.property?.name}
          </p>
        </div>
        <Badge>{lease.status_label}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conditions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Figure label="Période" value={`${date(lease.start_date)} → ${date(lease.end_date)}`} />
          <Figure label="Durée" value={`${lease.duration_months} mois`} />
          <Figure label="Loyer" value={money(lease.rent_amount)} />
          <Figure label="Charges" value={money(lease.charges_amount)} />
          <Figure label="Total mensuel" value={money(lease.monthly_total)} />
          <Figure label="Dépôt de garantie" value={money(lease.deposit_amount)} />
          <Figure label="Mois d'avance" value={String(lease.advance_months)} />
          <Figure label="Versement initial" value={money(lease.initial_payment)} />
          <Figure label="Jour d'échéance" value={`le ${lease.payment_day} de chaque mois`} />
          <Figure label="Préavis" value={`${lease.notice_period_days} jours`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!lease.has_generated_contract}
            onClick={() => documents.openContract(lease.id, lease.reference)}
          >
            <Download className="size-4 mr-1" /> Contrat généré
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!lease.has_signed_contract}
            onClick={() => documents.openContract(lease.id, lease.reference, true)}
          >
            <Download className="size-4 mr-1" /> Contrat signé
          </Button>
          {lease.signed_at && (
            <span className="text-xs text-muted-foreground self-center">
              Reçu le {date(lease.signed_at)}
            </span>
          )}
        </CardContent>
      </Card>

      {lease.status === 'pending_signature' && !lease.has_signed_contract && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            En attente du contrat signé et numérisé par le locataire.
            {lease.signature_rejection_reason && (
              <div className="mt-2 text-foreground">
                Dernier refus : {lease.signature_rejection_reason}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {canReviewSignature && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contrôler le document signé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              className="w-full"
              disabled={actions.validateSignature.isPending}
              onClick={() => actions.validateSignature.mutate()}
            >
              <Check className="size-4 mr-1" />
              {actions.validateSignature.isPending ? 'Validation...' : 'Valider — ouvre le paiement'}
            </Button>

            <div className="space-y-2 pt-4 border-t">
              <Label>Refuser — dites ce qui ne va pas, le locataire devra renvoyer</Label>
              <Textarea
                rows={2}
                value={refusal}
                onChange={(event) => setRefusal(event.target.value)}
                placeholder="La dernière page n'est pas signée."
              />
              <Button
                variant="destructive"
                disabled={!refusal.trim() || actions.rejectSignature.isPending}
                onClick={() => actions.rejectSignature.mutate(refusal)}
              >
                <X className="size-4 mr-1" /> Refuser le document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {lease.status === 'pending_payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Versement initial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {money(lease.initial_payment)} attendus — dépôt de garantie et {lease.advance_months}{' '}
              mois d'avance. Le bail devient actif dès l'encaissement.
            </p>
            <Button
              variant="outline"
              disabled={actions.recordCashInitial.isPending}
              onClick={() => actions.recordCashInitial.mutate()}
            >
              {actions.recordCashInitial.isPending
                ? 'Enregistrement...'
                : 'Encaissé en espèces — activer le bail'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Votre nom et l'horodatage seront attachés à cet encaissement et ne pourront plus être
              modifiés.
            </p>
          </CardContent>
        </Card>
      )}

      {(lease.status === 'active' || lease.status === 'expired' || lease.status === 'terminated') && (
        <LeaseLedger leaseId={lease.id} />
      )}
    </div>
  )
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div>{value}</div>
    </div>
  )
}

export default LeaseDetail
