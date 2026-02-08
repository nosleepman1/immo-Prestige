import { useSearchParams } from 'react-router-dom'
import { useReports } from '@/hooks/reports/useReports'
import { useReviewReport } from '@/hooks/reports/useReviewReport'
import type { ReportStatus } from '@/types/report'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const REASON_LABEL: Record<string, string> = {
  spam: 'Spam',
  abusive: 'Abusif',
  inappropriate: 'Inapproprié',
  other: 'Autre',
}

const TYPE_LABEL: Record<string, string> = {
  post: 'Publication',
  comment: 'Commentaire',
  comment_reply: 'Réponse',
}

const ReportsList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') as ReportStatus | null) ?? undefined
  const { data: reports, isLoading } = useReports(status)
  const reviewReport = useReviewReport()

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Signalements</h1>
        <p className="text-muted-foreground text-sm">Modération des contenus signalés par les utilisateurs</p>
      </div>

      <Tabs
        value={status ?? 'all'}
        onValueChange={(value) => setSearchParams(value === 'all' ? {} : { status: value })}
      >
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="reviewed">Traités</TabsTrigger>
          <TabsTrigger value="dismissed">Rejetés</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : !reports?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Aucun signalement dans cette catégorie.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contenu</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead>Signalé par</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <div className="font-medium">
                    {TYPE_LABEL[report.reportable_type]} #{report.reportable_id}
                  </div>
                  {report.details && <div className="text-xs text-muted-foreground max-w-xs truncate">{report.details}</div>}
                </TableCell>
                <TableCell>{REASON_LABEL[report.reason] ?? report.reason}</TableCell>
                <TableCell>{report.reporter?.name ?? '—'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      report.status === 'pending' ? 'secondary' : report.status === 'reviewed' ? 'default' : 'destructive'
                    }
                  >
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {report.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => reviewReport.mutate({ id: report.id, status: 'reviewed' })}
                        disabled={reviewReport.isPending}
                      >
                        Marquer traité
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reviewReport.mutate({ id: report.id, status: 'dismissed' })}
                        disabled={reviewReport.isPending}
                      >
                        Rejeter
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default ReportsList
