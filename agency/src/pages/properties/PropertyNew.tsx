import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema, type PropertyFormSchemaValues } from '@/lib/schemas'
import { usePropertyTypes, useDevises } from '@/hooks/properties/useReferenceData'
import { useCreateProperty } from '@/hooks/properties/usePropertyMutations'
import { useOwners } from '@/hooks/rental/useOwners'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const PropertyNew = () => {
  const propertyTypes = usePropertyTypes()
  const devises = useDevises()
  const owners = useOwners()
  const createProperty = useCreateProperty()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormSchemaValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: { transaction_type: 'sale', country: 'Sénégal' },
  })

  // Derived during render, not through an effect: which blocks to show follows
  // directly from the chosen transaction type.
  const transactionType = useWatch({ control, name: 'transaction_type' })
  const showSale = transactionType !== 'rent'
  const showRental = transactionType !== 'sale'

  const onSubmit = handleSubmit((values) => {
    // The server refuses a block that does not belong to the transaction type,
    // so the unused one is dropped rather than sent empty.
    createProperty.mutate({
      ...values,
      sale: showSale ? values.sale : undefined,
      rental: showRental ? values.rental : undefined,
    })
  })

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouveau bien</h1>
        <p className="text-muted-foreground text-sm">
          Le bien est créé en brouillon — publiez-le ensuite depuis sa fiche.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Le bien</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Titre" error={errors.name?.message} className="sm:col-span-2">
              <Input {...register('name')} />
            </Field>

            <Field label="Type de bien" error={errors.property_type_id?.message}>
              <Controller
                control={control}
                name="property_type_id"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.data?.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Devise" error={errors.devise_id?.message}>
              <Controller
                control={control}
                name="devise_id"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      {devises.data?.map((devise) => (
                        <SelectItem key={devise.id} value={String(devise.id)}>
                          {devise.name} ({devise.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              label="Propriétaire (facultatif)"
              error={errors.owner_id?.message}
              className="sm:col-span-2"
            >
              <Controller
                control={control}
                name="owner_id"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun propriétaire rattaché" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.data?.map((owner) => (
                        <SelectItem key={owner.id} value={String(owner.id)}>
                          {owner.full_name} — {owner.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
              <Textarea rows={3} {...register('description')} />
            </Field>

            <Field label="Superficie (m²)" error={errors.surface?.message}>
              <Input type="number" step="0.01" {...register('surface')} />
            </Field>
            <Field label="Pièces" error={errors.rooms?.message}>
              <Input type="number" {...register('rooms')} />
            </Field>
            <Field label="Chambres" error={errors.bedrooms?.message}>
              <Input type="number" {...register('bedrooms')} />
            </Field>
            <Field label="Pays" error={errors.country?.message}>
              <Input {...register('country')} />
            </Field>
            <Field label="Région" error={errors.region?.message}>
              <Input {...register('region')} />
            </Field>
            <Field label="Ville" error={errors.city?.message}>
              <Input {...register('city')} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Le bien est proposé" error={errors.transaction_type?.message}>
              <Controller
                control={control}
                name="transaction_type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">À la vente</SelectItem>
                      <SelectItem value="rent">À la location</SelectItem>
                      <SelectItem value="both">À la vente et à la location</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {showSale && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <Field label="Prix de vente" error={errors.sale?.price?.message}>
                  <Input type="number" {...register('sale.price')} />
                </Field>
                <label className="flex items-center gap-2 text-sm self-end pb-2">
                  <input type="checkbox" {...register('sale.negotiable')} />
                  Prix négociable
                </label>
              </div>
            )}

            {showRental && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <Field label="Loyer mensuel" error={errors.rental?.rent_amount?.message}>
                  <Input type="number" {...register('rental.rent_amount')} />
                </Field>
                <Field label="Charges mensuelles" error={errors.rental?.charges_amount?.message}>
                  <Input type="number" defaultValue={0} {...register('rental.charges_amount')} />
                </Field>
                <Field label="Dépôt de garantie" error={errors.rental?.deposit_amount?.message}>
                  <Input type="number" defaultValue={0} {...register('rental.deposit_amount')} />
                </Field>
                <Field label="Mois d'avance" error={errors.rental?.advance_months?.message}>
                  <Input type="number" defaultValue={1} {...register('rental.advance_months')} />
                </Field>
                <Field label="Durée minimale (mois)" error={errors.rental?.min_lease_months?.message}>
                  <Input type="number" defaultValue={12} {...register('rental.min_lease_months')} />
                </Field>
                <Field label="Disponible à partir du" error={errors.rental?.available_from?.message}>
                  <Input type="date" {...register('rental.available_from')} />
                </Field>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={createProperty.isPending}>
          {createProperty.isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" /> Création...
            </>
          ) : (
            'Créer le bien (brouillon)'
          )}
        </Button>
      </form>
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

export default PropertyNew
