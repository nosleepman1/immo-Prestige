import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check, FileText, X } from 'lucide-react'
import { useRentalApplication, useReviewApplication } from '@/hooks/rental/useRentalApplications'
import { useGenerateLease } from '@/hooks/rental/useLeases'
import { useContractTemplates } from '@/hooks/rental/useContractTemplates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { APPLICATION_STATUS_LABELS, isOpenToReview } from '@/types/rental'

const ApplicationDetail = () => {
  const { id } = useParams()
  const applicationId = Number(id)
  const navigate = useNavigate()

  const { data: application, isLoading, isError, refetch } = useRentalApplication(applicationId)
  const review = useReviewApplication(applicationId)
  const generateLease = useGenerateLease()
  const templates = useContractTemplates()

  const [rejectReason, setRejectReason] = useState('')
  const [documentsAsked, setDocumentsAsked] = useState('')
  const [leaseMonths, setLeaseMonths] = useState('')

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (isError || !application) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-muted-foreground text-sm">Cette demande est introuvable.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    )
  }

  const openToReview = isOpenToReview(application.status)

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      <Link
        to="/rental-applications"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4 mr-1" /> Retour aux demandes
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{application.applicant?.name}</h1>
          <p className="text-muted-foreground text-sm">
            {application.property?.name} — {application.property?.city}
          </p>
        </div>
        <Badge>{APPLICATION_STATUS_LABELS[application.status]}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Le dossier</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Figure
            label="Entrée souhaitée"
            value={new Date(application.desired_start_date).toLocaleDateString('fr-FR')}
          />
          <Figure label="Durée souhaitée" value={`${application.desired_duration_months} mois`} />
          <Figure label="Contact" value={application.applicant?.email ?? '—'} />
          <Figure
            label="Déposée le"
            value={new Date(application.created_at).toLocaleDateString('fr-FR')}
          />
          {application.message && (
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Message du candidat</div>
              <p className="whitespace-pre-line">{application.message}</p>
            </div>
          )}
          {application.rejection_reason && (
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Motif du refus</div>
              <p>{application.rejection_reason}</p>
            </div>
          )}
          {application.requested_documents && (
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Pièces réclamées</div>
              <p>{application.requested_documents}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pièces justificatives</CardTitle>
        </CardHeader>
        <CardContent>
          {!application.documents?.length ? (
            <p className="text-sm text-muted-foreground">Aucune pièce déposée.</p>
          ) : (
            <ul className="space-y-2">
              {application.documents.map((document) => (
                <li key={document.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    {document.type_label} — {document.original_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(document.size_bytes / 1024)} Ko
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {openToReview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instruire la demande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              onClick={() => review.accept.mutate()}
              disabled={review.accept.isPending}
              className="w-full"
            >
              <Check className="size-4 mr-1" />
              {review.accept.isPending ? 'Acceptation...' : 'Accepter la demande'}
            </Button>

            <div className="space-y-2 pt-4 border-t">
              <Label>Réclamer des pièces complémentaires</Label>
              <Textarea
                rows={2}
                value={documentsAsked}
                onChange={(event) => setDocumentsAsked(event.target.value)}
                placeholder="Trois derniers bulletins de salaire, attestation de travail..."
              />
              <Button
                variant="outline"
                disabled={!documentsAsked.trim() || review.requestDocuments.isPending}
                onClick={() => review.requestDocuments.mutate(documentsAsked)}
              >
                Demander ces pièces
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label>Refuser — le motif est obligatoire et sera envoyé au candidat</Label>
              <Textarea
                rows={2}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Revenus insuffisants au regard du loyer demandé."
              />
              <Button
                variant="destructive"
                disabled={!rejectReason.trim() || review.reject.isPending}
                onClick={() => review.reject.mutate(rejectReason)}
              >
                <X className="size-4 mr-1" /> Refuser la demande
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {application.status === 'accepted' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Établir le bail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Le contrat est assemblé à partir de vos clauses. Les montants sont figés à cet instant
              et ne suivront plus le bien.
            </p>

            {!templates.data?.length && (
              <p className="text-sm">
                Vous n'avez aucun modèle de contrat.{' '}
                <Link to="/contract-templates" className="underline">
                  Rédigez vos clauses
                </Link>{' '}
                — sans modèle, le bail sortira sans article particulier.
              </p>
            )}

            <div className="flex items-end gap-3">
              <div className="space-y-1.5">
                <Label>Durée (mois)</Label>
                <Input
                  type="number"
                  className="w-32"
                  value={leaseMonths}
                  onChange={(event) => setLeaseMonths(event.target.value)}
                  placeholder={String(application.desired_duration_months)}
                />
              </div>
              <Button
                disabled={generateLease.isPending}
                onClick={() =>
                  generateLease.mutate(
                    {
                      applicationId,
                      values: leaseMonths ? { duration_months: Number(leaseMonths) } : {},
                    },
                    { onSuccess: (lease) => navigate(`/leases/${lease.id}`) }
                  )
                }
              >
                {generateLease.isPending ? 'Génération...' : 'Générer le contrat'}
              </Button>
            </div>

            {generateLease.isError && (
              <p className="text-sm text-destructive">
                La génération a échoué. Vérifiez vos clauses : une variable inconnue arrête le
                contrat plutôt que de le rendre avec un trou.
              </p>
            )}
          </CardContent>
        </Card>
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

export default ApplicationDetail
