import React, { useMemo, useState } from 'react'
import { FiDownload, FiCalendar } from 'react-icons/fi'
import { useLeaseInstallments, useLeaseActions, useDocumentOpener } from '@/hooks/rental/useLeases'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorMessage } from '@/lib/apiError'
import type { InstallmentStatus } from '@/types/rental'

const STATUS_STYLE: Record<InstallmentStatus, string> = {
  pending: 'border-slate-200 bg-slate-50 text-slate-600',
  partially_paid: 'border-sky-200 bg-sky-50 text-sky-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  late: 'border-rose-200 bg-rose-50 text-rose-700',
  cancelled: 'border-slate-200 bg-slate-50 text-slate-400',
}

const money = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} XOF`
const period = (start: string, end: string) =>
  `${new Date(start).toLocaleDateString('fr-FR')} → ${new Date(end).toLocaleDateString('fr-FR')}`

/**
 * The lease's schedule, and the point where the agency records cash.
 *
 * The amount is never typed: it is the sum of what the selected months still
 * owe, taken from `remaining_due` which the API derives. A figure entered by
 * hand is exactly where an over-payment would come from.
 */
const LeaseLedger: React.FC<{ leaseId: number }> = ({ leaseId }) => {
  const { data: installments, isLoading, isError, refetch } = useLeaseInstallments(leaseId)
  const actions = useLeaseActions(leaseId)
  const documents = useDocumentOpener()
  const [selected, setSelected] = useState<number[]>([])

  const selectedTotal = useMemo(
    () =>
      (installments ?? [])
        .filter((installment) => selected.includes(installment.id))
        .reduce((sum, installment) => sum + installment.remaining_due, 0),
    [installments, selected]
  )

  const toggle = (id: number) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    )

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-6">
      <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2 mb-4">
        <FiCalendar className="w-4 h-4 text-emerald-600" /> Échéancier
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="size-6 text-emerald-600" />
        </div>
      ) : isError ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-xs text-slate-500">Impossible de charger l'échéancier.</p>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      ) : !installments?.length ? (
        <p className="text-xs text-slate-500">
          Aucune échéance. Elles sont créées chaque nuit pour les baux actifs.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="text-xs font-bold text-slate-700">Période</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Échéance</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Dû</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Réglé</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Statut</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">
                    Quittance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((installment) => (
                  <TableRow key={installment.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="py-3 pl-4">
                      <input
                        type="checkbox"
                        className="accent-emerald-600"
                        disabled={installment.remaining_due === 0}
                        checked={selected.includes(installment.id)}
                        onChange={() => toggle(installment.id)}
                      />
                    </TableCell>
                    <TableCell className="py-3 text-xs font-medium text-slate-700">
                      {period(installment.period_start, installment.period_end)}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-slate-600">
                      {new Date(installment.due_date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="py-3 text-xs font-semibold text-slate-800">
                      {money(installment.total_amount)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-xs font-semibold text-slate-800">
                        {money(installment.paid_amount)}
                      </div>
                      {installment.remaining_due > 0 && (
                        <div className="text-[11px] text-rose-600 font-medium">
                          reste {money(installment.remaining_due)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold ${STATUS_STYLE[installment.status]}`}
                      >
                        {installment.status_label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-6">
                      {installment.status === 'paid' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => documents.openReceipt(installment.id, installment.reference)}
                        >
                          <FiDownload className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in-50 duration-200">
              <div>
                <div className="text-sm font-bold text-emerald-900">
                  {selected.length} échéance{selected.length > 1 ? 's' : ''} — {money(selectedTotal)}
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Votre nom et l'horodatage seront attachés à cet encaissement, définitivement.
                </div>
              </div>
              <Button
                disabled={actions.recordCash.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20 shrink-0"
                onClick={() =>
                  actions.recordCash.mutate(
                    { ids: selected, amount: selectedTotal },
                    { onSuccess: () => setSelected([]) }
                  )
                }
              >
                {actions.recordCash.isPending ? 'Enregistrement...' : 'Encaisser en espèces'}
              </Button>
            </div>
          )}

          {actions.recordCash.isError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800">
              {apiErrorMessage(
                actions.recordCash.error,
                "L'encaissement a été refusé — le montant dépasse le reste dû sur ces échéances."
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LeaseLedger
