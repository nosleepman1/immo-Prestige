import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiFileText, FiFilter, FiPaperclip } from 'react-icons/fi'
import { useRentalApplications } from '@/hooks/rental/useRentalApplications'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { APPLICATION_STATUS_LABELS, type RentalApplicationStatus } from '@/types/rental'

/** Pill colours chosen so "à instruire" reads as a call to action, not as noise. */
const STATUS_STYLE: Record<RentalApplicationStatus, string> = {
  submitted: 'border-amber-200 bg-amber-50 text-amber-700',
  under_review: 'border-sky-200 bg-sky-50 text-sky-700',
  documents_requested: 'border-sky-200 bg-sky-50 text-sky-700',
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  cancelled: 'border-slate-200 bg-slate-50 text-slate-500',
}

const FILTERS: { value: RentalApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'submitted', label: 'À instruire' },
  { value: 'documents_requested', label: 'Pièces demandées' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'rejected', label: 'Refusées' },
]

const shortDate = (value: string) => new Date(value).toLocaleDateString('fr-FR')

/**
 * The agency's work queue. Oldest first, as the API returns it: the candidate
 * who has waited longest is the one at risk of going elsewhere.
 */
const ApplicationsList: React.FC = () => {
  const [filter, setFilter] = useState<RentalApplicationStatus | 'all'>('all')
  const { data, isLoading, isError, refetch } = useRentalApplications(
    filter === 'all' ? undefined : filter
  )

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
          Demandes de location
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Les dossiers déposés sur vos biens, du plus ancien au plus récent — le premier de la liste
          attend depuis le plus longtemps.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <FiFilter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={filter === option.value ? 'default' : 'outline'}
            className={
              filter === option.value
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold'
                : 'text-xs border-slate-200 text-slate-600'
            }
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="size-8 text-emerald-600" />
          <p className="text-xs font-medium text-slate-500">Chargement des demandes...</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <p className="text-sm font-medium text-slate-600">Impossible de charger les demandes.</p>
          <Button variant="outline" className="text-xs" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      ) : !data?.length ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <FiFileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-600">
            {filter === 'all'
              ? 'Aucune demande pour le moment.'
              : 'Aucune demande dans cet état.'}
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Les candidats déposent leur dossier depuis l'application mobile, sur vos biens publiés en
            location.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-700">Candidat</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Bien concerné</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Entrée souhaitée</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Durée</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Pièces</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((application) => (
                <TableRow key={application.id} className="hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3">
                    <Link
                      to={`/rental-applications/${application.id}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors"
                    >
                      {application.applicant?.name ?? 'Candidat'}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {application.applicant?.email} • déposée le {shortDate(application.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-slate-700">
                    {application.property?.name ?? '—'}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-slate-700">
                    {shortDate(application.desired_start_date)}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-slate-700">
                    {application.desired_duration_months} mois
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs font-semibold text-slate-600 inline-flex items-center gap-1">
                      <FiPaperclip className="w-3 h-3 text-slate-400" />
                      {application.documents_count ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right pr-6">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold ${STATUS_STYLE[application.status]}`}
                    >
                      {APPLICATION_STATUS_LABELS[application.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default ApplicationsList
