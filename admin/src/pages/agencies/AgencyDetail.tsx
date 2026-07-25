import { useParams, Link } from 'react-router-dom'
import { useAgency } from '@/hooks/agencies/useAgency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft } from 'lucide-react'

const AgencyDetail = () => {
  const { id } = useParams()
  const { data: agency, isLoading } = useAgency(Number(id))

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!agency) {
    return <p className="text-center py-16 text-muted-foreground">Agence introuvable.</p>
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      <Link to="/agencies" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Retour aux agences
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{agency.company_name}</h1>
          <p className="text-muted-foreground text-sm">{agency.manager_name}</p>
        </div>
        <div className="space-x-2">
          <Badge variant={agency.status === 'accepted' ? 'default' : agency.status === 'refused' ? 'destructive' : 'secondary'}>
            {agency.status}
          </Badge>
          {agency.is_verified && <Badge variant="outline">Vérifiée</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Adresse" value={`${agency.address}, ${agency.city}`} />
          <Info label="Zone d'activité" value={agency.activity_zone ?? '—'} />
          <Info label="Téléphone" value={agency.phone} />
          <Info label="Pièce d'identité" value={agency.id_card} />
          <Info label="Créée le" value={new Date(agency.created_at).toLocaleDateString('fr-FR')} />
          {agency.refusal_reason && <Info label="Motif de refus" value={agency.refusal_reason} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{agency.description}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents fournis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {agency.documents?.length ? (
            agency.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0 hover:underline"
              >
                <span>{doc.original_name}</span>
                <span className="text-muted-foreground text-xs">{doc.type}</span>
              </a>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucun document.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div>{value}</div>
    </div>
  )
}

export default AgencyDetail
