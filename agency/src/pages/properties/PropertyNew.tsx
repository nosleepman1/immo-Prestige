import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema, type PropertyFormSchemaValues } from '@/lib/schemas'
import { usePropertyTypes, useDevises } from '@/hooks/properties/useReferenceData'
import { useCreateProperty } from '@/hooks/properties/usePropertyMutations'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const PropertyNew = () => {
  const propertyTypes = usePropertyTypes()
  const devises = useDevises()
  const createProperty = useCreateProperty()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormSchemaValues>({ resolver: zodResolver(propertySchema) })

  const onSubmit = handleSubmit((values) => {
    createProperty.mutate(values)
  })

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouveau bien</h1>
        <p className="text-muted-foreground text-sm">Le bien est créé en brouillon — publiez-le ensuite depuis sa fiche.</p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Titre" error={errors.name?.message} className="sm:col-span-2">
          <Input {...register('name')} />
        </Field>

        <Field label="Type de bien" error={errors.property_type_id?.message}>
          <Controller
            control={control}
            name="property_type_id"
            render={({ field }) => (
              <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}>
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
              <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}>
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

        <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
          <Textarea rows={3} {...register('description')} />
        </Field>

        <Field label="Prix" error={errors.price?.message}>
          <Input type="number" step="0.01" {...register('price')} />
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
          <Input defaultValue="Sénégal" {...register('country')} />
        </Field>
        <Field label="Région" error={errors.region?.message}>
          <Input {...register('region')} />
        </Field>
        <Field label="Ville" error={errors.city?.message}>
          <Input {...register('city')} />
        </Field>

        <Button type="submit" className="sm:col-span-2" disabled={createProperty.isPending}>
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
