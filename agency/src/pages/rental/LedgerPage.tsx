import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLedger } from '@/hooks/rental/useLeases'
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
const LedgerPage = () => {
  const [status, setStatus] = useState('all')
  const { data, isLoading, isError, refetch } = useLedger(
    status === 'all' ? {} : { status }
  )

  const outstanding = (data ?? []).reduce((sum, row) => sum + row.remaining_due, 0)

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Échéances</h1>
        <p className="text-muted-foreground text-sm">
          Le registre de vos loyers, de l'échéance la plus ancienne à la plus récente
        </p>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            variant={status === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatus(option.value)}
          >
            {option.label}
          </Button>
        ))}
        {outstanding > 0 && (
          <span className="ml-auto text-sm">
            Reste à encaisser : <strong>{money(outstanding)}</strong>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : isError ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-muted-foreground text-sm">Impossible de charger le registre.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      ) : !data?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          Aucune échéance {status === 'all' ? '' : 'dans cet état'}.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quittance</TableHead>
              <TableHead>Locataire</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Dû</TableHead>
              <TableHead>Reste</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((installment) => (
              <TableRow key={installment.id}>
                <TableCell className="font-mono text-xs">{installment.reference}</TableCell>
                <TableCell>
                  {installment.lease ? (
                    <Link to={`/leases/${installment.lease.id}`} className="hover:underline">
                      {installment.lease.tenant?.name ?? installment.lease.reference}
                    </Link>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(installment.due_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>{money(installment.total_amount)}</TableCell>
                <TableCell>
                  {installment.remaining_due > 0 ? money(installment.remaining_due) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[installment.status]}>
                    {installment.status_label}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default LedgerPage
