import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useOwners, useOwnerMutations } from '@/hooks/rental/useOwners'
import { ownerSchema, type OwnerFormSchemaValues } from '@/lib/schemas'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

/**
 * Owners are agency-internal records: the mandate holders behind the listings.
 * They are never shown on a public page.
 */
const OwnersPage = () => {
  const { data: owners, isLoading, isError, refetch } = useOwners()
  const { create, remove } = useOwnerMutations()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OwnerFormSchemaValues>({ resolver: zodResolver(ownerSchema) })

  const onSubmit = handleSubmit((values) => {
    create.mutate(values, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  })

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Propriétaires</h1>
          <p className="text-muted-foreground text-sm">
            Les mandants pour lesquels votre agence gère des biens
          </p>
        </div>
        <Button onClick={() => setShowForm((open) => !open)}>
          <Plus className="size-4 mr-1" /> Nouveau propriétaire
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enregistrer un propriétaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom" error={errors.last_name?.message}>
                <Input {...register('last_name')} />
              </Field>
              <Field label="Prénom" error={errors.first_name?.message}>
                <Input {...register('first_name')} />
              </Field>
              <Field label="Téléphone" error={errors.phone?.message}>
                <Input {...register('phone')} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <Input type="email" {...register('email')} />
              </Field>
              <Field label="Adresse" error={errors.address?.message} className="sm:col-span-2">
                <Input {...register('address')} />
              </Field>
              <Field label="N° pièce d'identité" error={errors.id_document_number?.message}>
                <Input {...register('id_document_number')} />
              </Field>
              <Field label="Notes" error={errors.notes?.message} className="sm:col-span-2">
                <Textarea rows={2} {...register('notes')} />
              </Field>

              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : isError ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-muted-foreground text-sm">Impossible de charger les propriétaires.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      ) : !owners?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          Aucun propriétaire enregistré. Rattachez-en un à vos biens pour suivre vos mandats.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Biens</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.map((owner) => (
              <TableRow key={owner.id}>
                <TableCell>
                  <div className="font-medium">{owner.full_name}</div>
                  {owner.has_account && (
                    <Badge variant="secondary" className="mt-1">
                      Compte lié
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{owner.phone}</TableCell>
                <TableCell className="text-muted-foreground">{owner.email ?? '—'}</TableCell>
                <TableCell>{owner.properties_count ?? 0}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove.mutate(owner.id)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export default OwnersPage
