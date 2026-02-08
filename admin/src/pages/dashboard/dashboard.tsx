import { Link } from 'react-router-dom'
import { Activity, Building2, Flag, CheckCircle2, XCircle } from 'lucide-react'
import { useHealth } from '@/hooks/health/useHealth'
import { useAgencies } from '@/hooks/agencies/useAgencies'
import { useReports } from '@/hooks/reports/useReports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

const CHECK_LABELS: Record<string, string> = {
  database: 'Base de données',
  cache: 'Cache',
  failed_jobs: 'Jobs échoués',
}

const Dashboard = () => {
  const health = useHealth()
  const pendingAgencies = useAgencies('pending')
  const pendingReports = useReports('pending')

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm">Vue d'ensemble de la plateforme ImmoPrestige</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/agencies?status=pending">
          <Card className="hover:ring-primary/40 transition-colors">
            <CardHeader className="flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Agences en attente</CardTitle>
              <Building2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {pendingAgencies.isLoading ? <Spinner /> : (pendingAgencies.data?.length ?? 0)}
            </CardContent>
          </Card>
        </Link>

        <Link to="/reports?status=pending">
          <Card className="hover:ring-primary/40 transition-colors">
            <CardHeader className="flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Signalements en attente</CardTitle>
              <Flag className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {pendingReports.isLoading ? <Spinner /> : (pendingReports.data?.length ?? 0)}
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Santé plateforme</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {health.isLoading ? (
              <Spinner />
            ) : health.data ? (
              <Badge variant={health.data.status === 'ok' ? 'default' : 'destructive'}>
                {health.data.status === 'ok' ? 'Opérationnelle' : 'Dégradée'}
              </Badge>
            ) : (
              <Badge variant="destructive">Injoignable</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {health.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Détail des dépendances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(health.data.checks).map(([key, check]) => (
              <div key={key} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                <span>{CHECK_LABELS[key] ?? key}</span>
                {check.ok ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="size-4" /> OK
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="size-4" /> {check.detail ?? 'Échec'}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <a
        href={`${(import.meta.env.VITE_API_URL || '').replace(/\/api\/v1\/?$/, '')}/docs/api`}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-primary underline underline-offset-4"
      >
        Documentation de l'API (OpenAPI) →
      </a>
    </div>
  )
}

export default Dashboard
