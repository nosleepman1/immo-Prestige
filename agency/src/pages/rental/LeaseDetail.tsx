import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FiArrowLeft,
  FiCheck,
  FiDownload,
  FiX,
  FiFileText,
  FiAlertTriangle,
  FiDollarSign,
  FiClock,
} from 'react-icons/fi'
import { useLease, useLeaseActions, useDocumentOpener } from '@/hooks/rental/useLeases'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import type { LeaseStatus } from '@/types/rental'
import LeaseLedger from './LeaseLedger'

const STATUS_STYLE: Record<LeaseStatus, string> = {
  draft: 'border-slate-200 bg-slate-50 text-slate-500',
  pending_validation: 'border-amber-200 bg-amber-50 text-amber-700',
  pending_signature: 'border-amber-200 bg-amber-50 text-amber-700',
  pending_payment: 'border-amber-200 bg-amber-50 text-amber-700',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  terminated: 'border-rose-200 bg-rose-50 text-rose-700',
  expired: 'border-slate-200 bg-slate-50 text-slate-500',
  cancelled: 'border-slate-200 bg-slate-50 text-slate-500',
}

const money = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} XOF`
const date = (value: string) => new Date(value).toLocaleDateString('fr-FR')

const LeaseDetail: React.FC = () => {
  const { id } = useParams()
  const leaseId = Number(id)

  const { data: lease, isLoading, isError, refetch } = useLease(leaseId)
  const actions = useLeaseActions(leaseId)
  const documents = useDocumentOpener()
  const [refusal, setRefusal] = useState('')

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="size-8 text-emerald-600" />
        <p className="text-xs font-medium text-slate-500">Chargement du bail...</p>
      </div>
    )
  }

  if (isError || !lease) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 max-w-2xl mx-auto">
        <FiAlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-sm font-medium text-slate-600">Ce bail est introuvable.</p>
        <Button variant="outline" className="text-xs" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    )
  }

  // The scan can only be reviewed once it has actually arrived.
  const canReviewSignature = lease.status === 'pending_signature' && lease.has_signed_contract

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      <Link
        to="/leases"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs"
      >
        <FiArrowLeft className="w-4 h-4" /> Retour aux baux
      </Link>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FiFileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading font-mono">
                {lease.reference}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                {lease.tenant?.name} — {lease.property?.name}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[11px] font-semibold shrink-0 ${STATUS_STYLE[lease.status]}`}
          >
            {lease.status_label}
          </Badge>
        </div>
      </div>

      <Section title="Conditions" icon={FiDollarSign}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Figure label="Période" value={`${date(lease.start_date)} → ${date(lease.end_date)}`} />
          <Figure label="Durée" value={`${lease.duration_months} mois`} />
          <Figure label="Loyer" value={money(lease.rent_amount)} />
          <Figure label="Charges" value={money(lease.charges_amount)} />
          <Figure label="Total mensuel" value={money(lease.monthly_total)} highlight />
          <Figure label="Dépôt de garantie" value={money(lease.deposit_amount)} />
          <Figure label="Mois d'avance" value={String(lease.advance_months)} />
          <Figure label="Versement initial" value={money(lease.initial_payment)} highlight />
          <Figure label="Jour d'échéance" value={`le ${lease.payment_day} du mois`} />
          <Figure label="Préavis" value={`${lease.notice_period_days} jours`} />
        </div>
        <p className="text-[11px] text-slate-400 mt-4 pt-4 border-t border-slate-100">
          Ces montants ont été figés à la génération du contrat : revaloriser l'annonce ne les
          modifie pas.
        </p>
      </Section>

      <Section title="Documents" icon={FiFileText}>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={!lease.has_generated_contract}
            onClick={() => documents.openContract(lease.id, lease.reference)}
          >
            <FiDownload className="w-4 h-4 mr-1.5" /> Contrat généré
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={!lease.has_signed_contract}
            onClick={() => documents.openContract(lease.id, lease.reference, true)}
          >
            <FiDownload className="w-4 h-4 mr-1.5" /> Contrat signé
          </Button>
          {lease.signed_at && (
            <span className="text-[11px] text-slate-500 ml-1">Reçu le {date(lease.signed_at)}</span>
          )}
        </div>
      </Section>

      {lease.status === 'pending_signature' && !lease.has_signed_contract && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
          <FiClock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-900">
              En attente du contrat signé et numérisé par le locataire.
            </p>
            {lease.signature_rejection_reason && (
              <p className="text-[11px] text-amber-800 mt-1">
                Dernier refus : {lease.signature_rejection_reason}
              </p>
            )}
          </div>
        </div>
      )}

      {canReviewSignature && (
        <Section title="Contrôler le document signé" icon={FiCheck}>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20"
            disabled={actions.validateSignature.isPending}
            onClick={() => actions.validateSignature.mutate()}
          >
            <FiCheck className="w-4 h-4 mr-1.5" />
            {actions.validateSignature.isPending ? 'Validation...' : 'Valider — ouvre le paiement'}
          </Button>

          <div className="space-y-2 pt-5 mt-5 border-t border-slate-100">
            <Label className="text-xs font-semibold text-slate-700">Refuser le document</Label>
            <Textarea
              rows={2}
              className="text-xs resize-y"
              value={refusal}
              onChange={(event) => setRefusal(event.target.value)}
              placeholder="La dernière page n'est pas signée."
            />
            <p className="text-[11px] text-slate-500">
              Dites ce qui ne va pas : le locataire devra renvoyer un document corrigé.
            </p>
            <Button
              variant="destructive"
              className="text-xs"
              disabled={!refusal.trim() || actions.rejectSignature.isPending}
              onClick={() => actions.rejectSignature.mutate(refusal)}
            >
              <FiX className="w-4 h-4 mr-1.5" /> Refuser le document
            </Button>
          </div>
        </Section>
      )}

      {lease.status === 'pending_payment' && (
        <Section title="Versement initial" icon={FiDollarSign}>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 mb-4">
            <div className="text-2xl font-bold text-emerald-800 font-heading">
              {money(lease.initial_payment)}
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Dépôt de garantie et {lease.advance_months} mois d'avance. Le bail devient actif dès
              l'encaissement.
            </p>
          </div>

          <Button
            variant="outline"
            className="text-xs"
            disabled={actions.recordCashInitial.isPending}
            onClick={() => actions.recordCashInitial.mutate()}
          >
            {actions.recordCashInitial.isPending
              ? 'Enregistrement...'
              : 'Encaissé en espèces — activer le bail'}
          </Button>
          <p className="text-[11px] text-slate-500 mt-2">
            Votre nom et l'horodatage seront attachés à cet encaissement, définitivement.
          </p>
        </Section>
      )}

      {(lease.status === 'active' || lease.status === 'expired' || lease.status === 'terminated') && (
        <LeaseLedger leaseId={lease.id} />
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

function Figure({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div
        className={`text-xs font-semibold mt-0.5 ${highlight ? 'text-emerald-800' : 'text-slate-800'}`}
      >
        {value}
      </div>
    </div>
  )
}

export default LeaseDetail
