import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { useLeaseInstallments, useLeaseActions, useDocumentOpener } from '@/hooks/rental/useLeases'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { InstallmentStatus } from '@/types/rental'

const STATUS_VARIANT: Record<InstallmentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  partially_paid: 'secondary',
  paid: 'default',
  late: 'destructive',
  cancelled: 'outline',
}

const money = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} XOF`
const period = (start: string, end: string) =>
  `${new Date(start).toLocaleDateString('fr-FR')} → ${new Date(end).toLocaleDateString('fr-FR')}`

/**
 * The lease's schedule, and the point where the agency records cash.
 *
 * The amount is never typed: it is the sum of what the selected months still
 * owe, computed from `remaining_due` which the API derives. A figure entered by
 * hand is exactly where an over-payment would come from.
 */
const LeaseLedger = ({ leaseId }: { leaseId: number }) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-6 space-y-2">
        <p className="text-muted-foreground text-sm">Impossible de charger l'échéancier.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Échéancier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!installments?.length ? (
          <p className="text-sm text-muted-foreground">
            Aucune échéance. Elles sont créées chaque nuit pour les baux actifs.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Période</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Dû</TableHead>
                  <TableHead>Réglé</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        disabled={installment.remaining_due === 0}
                        checked={selected.includes(installment.id)}
                        onChange={() => toggle(installment.id)}
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      {period(installment.period_start, installment.period_end)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(installment.due_date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>{money(installment.total_amount)}</TableCell>
                    <TableCell>
                      {money(installment.paid_amount)}
                      {installment.remaining_due > 0 && (
                        <div className="text-xs text-muted-foreground">
                          reste {money(installment.remaining_due)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[installment.status]}>
                        {installment.status_label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {installment.status === 'paid' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => documents.openReceipt(installment.id, installment.reference)}
                        >
                          <Download className="size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {selected.length > 0 && (
              <div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-md">
                <div className="text-sm">
                  <div className="font-medium">
                    {selected.length} échéance{selected.length > 1 ? 's' : ''} — {money(selectedTotal)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Votre nom et l'horodatage seront attachés à cet encaissement, définitivement.
                  </div>
                </div>
                <Button
                  disabled={actions.recordCash.isPending}
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
              <p className="text-sm text-destructive">
                L'encaissement a été refusé — le montant dépasse le reste dû sur ces échéances.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default LeaseLedger
