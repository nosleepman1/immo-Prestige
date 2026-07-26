import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRentalApplications } from '@/hooks/rental/useRentalApplications'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { APPLICATION_STATUS_LABELS, type RentalApplicationStatus } from '@/types/rental'

const STATUS_VARIANT: Record<RentalApplicationStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  submitted: 'default',
  under_review: 'secondary',
  documents_requested: 'secondary',
  accepted: 'default',
  rejected: 'destructive',
  cancelled: 'outline',
}

const FILTERS: { value: RentalApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'submitted', label: 'À instruire' },
  { value: 'documents_requested', label: 'Pièces demandées' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'rejected', label: 'Refusées' },
]

/**
 * The agency's work queue. Oldest first, as the API returns it: the candidate
 * who has waited longest is the one at risk of going elsewhere.
 */
const ApplicationsList = () => {
  const [filter, setFilter] = useState<RentalApplicationStatus | 'all'>('all')
  const { data, isLoading, isError, refetch } = useRentalApplications(
    filter === 'all' ? undefined : filter
  )

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Demandes de location</h1>
        <p className="text-muted-foreground text-sm">
          Les dossiers déposés sur vos biens, du plus ancien au plus récent
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
          <p className="text-muted-foreground text-sm">Impossible de charger les demandes.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      ) : !data?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          Aucune demande {filter === 'all' ? '' : 'dans cet état'} pour le moment.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidat</TableHead>
              <TableHead>Bien</TableHead>
              <TableHead>Entrée souhaitée</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Pièces</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <Link
                    to={`/rental-applications/${application.id}`}
                    className="font-medium hover:underline"
                  >
                    {application.applicant?.name ?? 'Candidat'}
                  </Link>
                  <div className="text-xs text-muted-foreground">{application.applicant?.email}</div>
                </TableCell>
                <TableCell>{application.property?.name ?? '—'}</TableCell>
                <TableCell>
                  {new Date(application.desired_start_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>{application.desired_duration_months} mois</TableCell>
                <TableCell>{application.documents_count ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[application.status]}>
                    {APPLICATION_STATUS_LABELS[application.status]}
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

export default ApplicationsList
