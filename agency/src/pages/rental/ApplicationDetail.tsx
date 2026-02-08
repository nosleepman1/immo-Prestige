import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiCheck,
  FiFileText,
  FiPaperclip,
  FiX,
  FiAlertTriangle,
  FiUser,
} from 'react-icons/fi'
import { useRentalApplication, useReviewApplication } from '@/hooks/rental/useRentalApplications'
import { useGenerateLease } from '@/hooks/rental/useLeases'
import { useContractTemplates } from '@/hooks/rental/useContractTemplates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorMessage } from '@/lib/apiError'
import { APPLICATION_STATUS_LABELS, isOpenToReview, type RentalApplicationStatus } from '@/types/rental'

const STATUS_STYLE: Record<RentalApplicationStatus, string> = {
  submitted: 'border-amber-200 bg-amber-50 text-amber-700',
  under_review: 'border-sky-200 bg-sky-50 text-sky-700',
  documents_requested: 'border-sky-200 bg-sky-50 text-sky-700',
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  cancelled: 'border-slate-200 bg-slate-50 text-slate-500',
}

const longDate = (value: string) => new Date(value).toLocaleDateString('fr-FR')

const ApplicationDetail: React.FC = () => {
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="size-8 text-emerald-600" />
        <p className="text-xs font-medium text-slate-500">Chargement du dossier...</p>
      </div>
    )
  }

  if (isError || !application) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 max-w-2xl mx-auto">
        <FiAlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-sm font-medium text-slate-600">Cette demande est introuvable.</p>
        <Button variant="outline" className="text-xs" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    )
  }

  const openToReview = isOpenToReview(application.status)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      <Link
        to="/rental-applications"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs"
      >
        <FiArrowLeft className="w-4 h-4" /> Retour aux demandes
      </Link>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
                {application.applicant?.name}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                {application.property?.name} — {application.property?.city}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[11px] font-semibold shrink-0 ${STATUS_STYLE[application.status]}`}
          >
            {APPLICATION_STATUS_LABELS[application.status]}
          </Badge>
        </div>
      </div>

      <Section title="Le dossier" icon={FiFileText}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Figure label="Entrée souhaitée" value={longDate(application.desired_start_date)} />
          <Figure label="Durée souhaitée" value={`${application.desired_duration_months} mois`} />
          <Figure label="Déposée le" value={longDate(application.created_at)} />
          <Figure label="Contact" value={application.applicant?.email ?? '—'} />
        </div>

        {application.message && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Message du candidat
            </div>
            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              {application.message}
            </p>
          </div>
        )}

        {application.rejection_reason && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 mb-1">
              Motif du refus
            </div>
            <p className="text-xs text-rose-800">{application.rejection_reason}</p>
          </div>
        )}

        {application.requested_documents && (
          <div className="mt-4 p-3 rounded-xl bg-sky-50 border border-sky-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-600 mb-1">
              Pièces réclamées
            </div>
            <p className="text-xs text-sky-800">{application.requested_documents}</p>
          </div>
        )}
      </Section>

      <Section title="Pièces justificatives" icon={FiPaperclip}>
        {!application.documents?.length ? (
          <p className="text-xs text-slate-500">Aucune pièce déposée pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {application.documents.map((document) => (
              <li key={document.id} className="flex items-center justify-between py-2.5 first:pt-0">
                <span className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FiFileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-slate-800 truncate">
                      {document.type_label}
                    </span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      {document.original_name}
                    </span>
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 shrink-0 ml-3">
                  {Math.round(document.size_bytes / 1024)} Ko
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {openToReview && (
        <Section title="Instruire la demande" icon={FiCheck}>
          <Button
            onClick={() => review.accept.mutate()}
            disabled={review.accept.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20"
          >
            <FiCheck className="w-4 h-4 mr-1.5" />
            {review.accept.isPending ? 'Acceptation...' : 'Accepter la demande'}
          </Button>

          <div className="space-y-2 pt-5 mt-5 border-t border-slate-100">
            <Label className="text-xs font-semibold text-slate-700">
              Réclamer des pièces complémentaires
            </Label>
            <Textarea
              rows={2}
              className="text-xs resize-y"
              value={documentsAsked}
              onChange={(event) => setDocumentsAsked(event.target.value)}
              placeholder="Trois derniers bulletins de salaire, attestation de travail..."
            />
            <p className="text-[11px] text-slate-500">
              Le dossier reste bloquant : le candidat ne peut pas en déposer un second sur ce bien.
            </p>
            <Button
              variant="outline"
              className="text-xs"
              disabled={!documentsAsked.trim() || review.requestDocuments.isPending}
              onClick={() => review.requestDocuments.mutate(documentsAsked)}
            >
              Demander ces pièces
            </Button>
          </div>

          <div className="space-y-2 pt-5 mt-5 border-t border-slate-100">
            <Label className="text-xs font-semibold text-slate-700">Refuser la demande</Label>
            <Textarea
              rows={2}
              className="text-xs resize-y"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Revenus insuffisants au regard du loyer demandé."
            />
            <p className="text-[11px] text-slate-500">
              Le motif est obligatoire et sera repris tel quel dans le courriel envoyé au candidat.
            </p>
            <Button
              variant="destructive"
              className="text-xs"
              disabled={!rejectReason.trim() || review.reject.isPending}
              onClick={() => review.reject.mutate(rejectReason)}
            >
              <FiX className="w-4 h-4 mr-1.5" /> Refuser la demande
            </Button>
          </div>
        </Section>
      )}

      {application.status === 'accepted' && (
        <Section title="Établir le bail" icon={FiFileText}>
          <p className="text-xs text-slate-500 mb-4">
            Le contrat est assemblé à partir de vos clauses. Les montants sont figés à cet instant et
            ne suivront plus une revalorisation du bien.
          </p>

          {!templates.data?.length && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
              Vous n'avez aucun modèle de contrat.{' '}
              <Link to="/contract-templates" className="font-semibold underline">
                Rédigez vos clauses
              </Link>{' '}
              — sans modèle, le bail sortira avec la structure de la plateforme mais aucun article
              particulier.
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Durée (mois)</Label>
              <Input
                type="number"
                className="w-32 text-xs"
                value={leaseMonths}
                onChange={(event) => setLeaseMonths(event.target.value)}
                placeholder={String(application.desired_duration_months)}
              />
            </div>
            <Button
              disabled={generateLease.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20"
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
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800">
              {apiErrorMessage(
                generateLease.error,
                'La génération a échoué. Vérifiez vos clauses : une variable inconnue arrête le contrat plutôt que de le rendre avec un trou dedans.'
              )}
            </div>
          )}
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-6">
      <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-emerald-600" /> {title}
      </h2>
      {children}
    </div>
  )
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-xs font-semibold text-slate-800 mt-0.5 break-words">{value}</div>
    </div>
  )
}

export default ApplicationDetail
