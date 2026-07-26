import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLeases } from '@/hooks/rental/useLeases'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { LeaseStatus } from '@/types/rental'

const STATUS_VARIANT: Record<LeaseStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline',
  pending_validation: 'secondary',
  pending_signature: 'secondary',
  pending_payment: 'secondary',
  active: 'default',
  terminated: 'destructive',
  expired: 'outline',
  cancelled: 'outline',
}

const FILTERS: { value: LeaseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'pending_signature', label: 'Attente signature' },
  { value: 'pending_payment', label: 'Attente paiement' },
  { value: 'active', label: 'Actifs' },
  { value: 'expired', label: 'Expirés' },
]

const money = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} XOF`

const LeasesList = () => {
  const [filter, setFilter] = useState<LeaseStatus | 'all'>('all')
  const { data, isLoading, isError, refetch } = useLeases(filter === 'all' ? undefined : filter)

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Baux</h1>
        <p className="text-muted-foreground text-sm">
          Les contrats de location de votre agence, en cours et passés
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : isError ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-muted-foreground text-sm">Impossible de charger les baux.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      ) : !data?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          Aucun bail {filter === 'all' ? '' : 'dans cet état'}. Un bail naît d'une demande de
          location acceptée.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Locataire</TableHead>
              <TableHead>Bien</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Loyer</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((lease) => (
              <TableRow key={lease.id}>
                <TableCell>
                  <Link to={`/leases/${lease.id}`} className="font-medium hover:underline">
                    {lease.reference}
                  </Link>
                </TableCell>
                <TableCell>{lease.tenant?.name ?? '—'}</TableCell>
                <TableCell>{lease.property?.name ?? '—'}</TableCell>
                <TableCell className="text-sm">
                  {new Date(lease.start_date).toLocaleDateString('fr-FR')} →{' '}
                  {new Date(lease.end_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>{money(lease.monthly_total)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[lease.status]}>{lease.status_label}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default LeasesList
