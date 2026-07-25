import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAgencies } from '@/hooks/agencies/useAgencies'
import { useAcceptAgency } from '@/hooks/agencies/useAcceptAgency'
import { useRefuseAgency } from '@/hooks/agencies/useRefuseAgency'
import { refuseAgencySchema, type RefuseAgencyFormValues } from '@/lib/schemas'
import type { Agency, AgencyStatus } from '@/types/auth'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const STATUS_LABEL: Record<AgencyStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  refused: 'Refusée',
}

const STATUS_VARIANT: Record<AgencyStatus, 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  accepted: 'default',
  refused: 'destructive',
}

const AgenciesList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') as AgencyStatus | null) ?? undefined
  const { data: agencies, isLoading } = useAgencies(status)
  const acceptAgency = useAcceptAgency()
  const [refusing, setRefusing] = useState<Agency | null>(null)

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Agences</h1>
        <p className="text-muted-foreground text-sm">Validation des dossiers de candidature agence</p>
      </div>

      <Tabs
        value={status ?? 'all'}
        onValueChange={(value) => setSearchParams(value === 'all' ? {} : { status: value })}
      >
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="accepted">Acceptées</TabsTrigger>
          <TabsTrigger value="refused">Refusées</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : !agencies?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Aucune agence dans cette catégorie.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agence</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agencies.map((agency) => (
              <TableRow key={agency.id}>
                <TableCell>
                  <Link to={`/agencies/${agency.id}`} className="font-medium hover:underline">
                    {agency.company_name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{agency.manager_name}</div>
                </TableCell>
                <TableCell>{agency.city}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[agency.status]}>{STATUS_LABEL[agency.status]}</Badge>
                  {agency.is_verified && (
                    <Badge variant="outline" className="ml-1">
                      Vérifiée
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {agency.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => acceptAgency.mutate(agency.id)}
                        disabled={acceptAgency.isPending}
                      >
                        Accepter
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRefusing(agency)}>
                        Refuser
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <RefuseAgencyDialog agency={refusing} onClose={() => setRefusing(null)} />
    </div>
  )
}

function RefuseAgencyDialog({ agency, onClose }: { agency: Agency | null; onClose: () => void }) {
  const refuseAgency = useRefuseAgency()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RefuseAgencyFormValues>({ resolver: zodResolver(refuseAgencySchema) })

  const onSubmit = (data: RefuseAgencyFormValues) => {
    if (!agency) return
    refuseAgency.mutate(
      { id: agency.id, reason: data.reason },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={!!agency} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refuser {agency?.company_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Motif du refus</Label>
            <Textarea id="reason" rows={4} {...register('reason')} />
            {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="destructive" disabled={refuseAgency.isPending}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AgenciesList
