import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiFilter, FiAlertTriangle } from 'react-icons/fi'
import { useLedger } from '@/hooks/rental/useLeases'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { InstallmentStatus } from '@/types/rental'

const STATUS_STYLE: Record<InstallmentStatus, string> = {
  pending: 'border-slate-200 bg-slate-50 text-slate-600',
  partially_paid: 'border-sky-200 bg-sky-50 text-sky-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  late: 'border-rose-200 bg-rose-50 text-rose-700',
  cancelled: 'border-slate-200 bg-slate-50 text-slate-400',
}

const money = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} XOF`

const FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'late', label: 'En retard' },
  { value: 'pending', label: 'Attendues' },
  { value: 'partially_paid', label: 'Partielles' },
  { value: 'paid', label: 'Réglées' },
]

/**
 * Every instalment across the agency's leases, oldest due date first — the
 * arrear at the top is the one worth a phone call.
 */
const LedgerPage: React.FC = () => {
  const [status, setStatus] = useState('all')
  const { data, isLoading, isError, refetch } = useLedger(status === 'all' ? {} : { status })

  const outstanding = (data ?? []).reduce((sum, row) => sum + row.remaining_due, 0)
  const lateCount = (data ?? []).filter((row) => row.status === 'late').length

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Échéances</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Le registre de vos loyers, de l'échéance la plus ancienne à la plus récente.
        </p>
      </div>

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Reste à encaisser
            </div>
            <div className="text-2xl font-bold text-slate-900 font-heading mt-1">
              {money(outstanding)}
            </div>
          </div>
          <div
            className={`rounded-2xl shadow-2xs p-5 border ${
              lateCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-200/80'
            }`}
          >
            <div
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                lateCount > 0 ? 'text-rose-500' : 'text-slate-400'
              }`}
            >
              Échéances en retard
            </div>
            <div
              className={`text-2xl font-bold font-heading mt-1 flex items-center gap-2 ${
                lateCount > 0 ? 'text-rose-800' : 'text-slate-900'
              }`}
            >
              {lateCount > 0 && <FiAlertTriangle className="w-5 h-5" />}
              {lateCount}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <FiFilter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={status === option.value ? 'default' : 'outline'}
            className={
              status === option.value
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold'
                : 'text-xs border-slate-200 text-slate-600'
            }
            onClick={() => setStatus(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="size-8 text-emerald-600" />
          <p className="text-xs font-medium text-slate-500">Chargement du registre...</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <p className="text-sm font-medium text-slate-600">Impossible de charger le registre.</p>
          <Button variant="outline" className="text-xs" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      ) : !data?.length ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <FiCalendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-600">
            {status === 'all' ? 'Aucune échéance.' : 'Aucune échéance dans cet état.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-700">Quittance</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Locataire</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Échéance</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Dû</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Reste</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((installment) => (
                <TableRow key={installment.id} className="hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-mono text-[11px] text-slate-500">
                    {installment.reference}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-slate-700">
                    {installment.lease ? (
                      <Link
                        to={`/leases/${installment.lease.id}`}
                        className="hover:text-emerald-700 transition-colors font-semibold"
                      >
                        {installment.lease.tenant?.name ?? installment.lease.reference}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-600">
                    {new Date(installment.due_date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-semibold text-slate-800">
                    {money(installment.total_amount)}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold">
                    {installment.remaining_due > 0 ? (
                      <span className="text-rose-600">{money(installment.remaining_due)}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right pr-6">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold ${STATUS_STYLE[installment.status]}`}
                    >
                      {installment.status_label}
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

export default LedgerPage
