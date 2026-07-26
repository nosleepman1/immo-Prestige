import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiFileText, FiFilter } from 'react-icons/fi'
import { useLeases } from '@/hooks/rental/useLeases'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { LeaseStatus } from '@/types/rental'

/** Amber means "someone owes an action"; emerald means the lease is running. */
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

const FILTERS: { value: LeaseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'pending_signature', label: 'Attente signature' },
  { value: 'pending_payment', label: 'Attente paiement' },
  { value: 'active', label: 'Actifs' },
  { value: 'expired', label: 'Expirés' },
]

const money = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} XOF`
const shortDate = (value: string) => new Date(value).toLocaleDateString('fr-FR')

const LeasesList: React.FC = () => {
  const [filter, setFilter] = useState<LeaseStatus | 'all'>('all')
  const { data, isLoading, isError, refetch } = useLeases(filter === 'all' ? undefined : filter)

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Baux</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Les contrats de location de votre agence, en cours et passés.
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
          <p className="text-xs font-medium text-slate-500">Chargement des baux...</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <p className="text-sm font-medium text-slate-600">Impossible de charger les baux.</p>
          <Button variant="outline" className="text-xs" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      ) : !data?.length ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <FiFileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-600">
            {filter === 'all' ? 'Aucun bail.' : 'Aucun bail dans cet état.'}
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Un bail naît d'une demande de location acceptée, depuis la fiche du dossier.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-700">Référence</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Locataire</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Bien</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Période</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Loyer mensuel</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((lease) => (
                <TableRow key={lease.id} className="hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3">
                    <Link
                      to={`/leases/${lease.id}`}
                      className="font-bold text-xs font-mono text-slate-900 hover:text-emerald-700 transition-colors"
                    >
                      {lease.reference}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-slate-700">
                    {lease.tenant?.name ?? '—'}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-slate-700">
                    {lease.property?.name ?? '—'}
                  </TableCell>
                  <TableCell className="py-3 text-[11px] text-slate-500">
                    {shortDate(lease.start_date)} → {shortDate(lease.end_date)}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold text-emerald-800">
                    {money(lease.monthly_total)}
                  </TableCell>
                  <TableCell className="py-3 text-right pr-6">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold ${STATUS_STYLE[lease.status]}`}
                    >
                      {lease.status_label}
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

export default LeasesList
