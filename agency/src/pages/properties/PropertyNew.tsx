import React from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FiArrowLeft,
  FiHome,
  FiDollarSign
} from 'react-icons/fi'
import { CgSpinner } from 'react-icons/cg'
import { propertySchema, type PropertyFormSchemaValues } from '@/lib/schemas'
import { usePropertyTypes, useDevises } from '@/hooks/properties/useReferenceData'
import { useCreateProperty } from '@/hooks/properties/usePropertyMutations'
import { useOwners } from '@/hooks/rental/useOwners'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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

  const transactionType = useWatch({ control, name: 'transaction_type' })
  const showSale = transactionType !== 'rent'
  const showRental = transactionType !== 'sale'

  const onSubmit = handleSubmit((values) => {
    createProperty.mutate({
      ...values,
      sale: showSale ? values.sale : undefined,
      rental: showRental ? values.rental : undefined,
    })
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <FiArrowLeft className="w-4 h-4" /> Retour aux biens
        </Link>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <FiHome className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Nouveau Bien Immobilier</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Renseignez les détails du bien. Il sera initialement enregistré en mode <span className="font-semibold text-amber-600">brouillon</span>.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Section 1: Informations Principales du Bien */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <FiHome className="w-4 h-4 text-emerald-600" /> Informations du Bien
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Caractéristiques physiques et typologie de l'annonce
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Titre de l'annonce *" error={errors.name?.message} className="sm:col-span-2">
              <Input placeholder="Ex: Appt F4 Haut Standing avec Vue Mer..." {...register('name')} className="text-xs" />
            </Field>

            <Field label="Type de bien *" error={errors.property_type_id?.message}>
              <Controller
                control={control}
                name="property_type_id"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Sélectionner le type" />
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

            <Field label="Devise d'affichage *" error={errors.devise_id?.message}>
              <Controller
                control={control}
                name="devise_id"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Devise" />
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
              label="Propriétaire Bailleur (Optionnel)"
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
                    <SelectTrigger className="text-xs">
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

            <Field label="Description détaillée" error={errors.description?.message} className="sm:col-span-2">
              <Textarea
                rows={3}
                placeholder="Rédigez une description attractive du bien (équipements, proximité...)"
                {...register('description')}
                className="text-xs resize-y"
              />
            </Field>

            <Field label="Superficie (m²) *" error={errors.surface?.message}>
              <Input type="number" step="0.01" placeholder="Ex: 120.5" {...register('surface')} className="text-xs" />
            </Field>
            <Field label="Nombre de pièces *" error={errors.rooms?.message}>
              <Input type="number" placeholder="Ex: 4" {...register('rooms')} className="text-xs" />
            </Field>

            <Field label="Nombre de chambres" error={errors.bedrooms?.message}>
              <Input type="number" placeholder="Ex: 3" {...register('bedrooms')} className="text-xs" />
            </Field>
            <Field label="Pays *" error={errors.country?.message}>
              <Input placeholder="Sénégal" {...register('country')} className="text-xs" />
            </Field>

            <Field label="Région *" error={errors.region?.message}>
              <Input placeholder="Dakar" {...register('region')} className="text-xs" />
            </Field>
            <Field label="Ville / Quartier *" error={errors.city?.message}>
              <Input placeholder="Almadies, Mermoz..." {...register('city')} className="text-xs" />
            </Field>
          </CardContent>
        </Card>

        {/* Section 2: Modalités & Financier */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <FiDollarSign className="w-4 h-4 text-emerald-600" /> Transaction & Conditions Financières
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Définissez si le bien est proposé à la vente, à la location ou aux deux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Type de proposition *" error={errors.transaction_type?.message}>
              <Controller
                control={control}
                name="transaction_type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">À la Vente uniquement</SelectItem>
                      <SelectItem value="rent">À la Location uniquement</SelectItem>
                      <SelectItem value="both">Proposé à la Vente et à la Location</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Formulaire Vente */}
            {showSale && (
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-4">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Conditions de Vente</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Prix de vente *" error={errors.sale?.price?.message}>
                    <Input type="number" placeholder="Ex: 85000000" {...register('sale.price')} className="text-xs bg-white" />
                  </Field>
                  <div className="flex items-center gap-2 self-end pb-2">
                    <input
                      type="checkbox"
                      id="sale-negotiable"
                      {...register('sale.negotiable')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <Label htmlFor="sale-negotiable" className="text-xs text-slate-700 cursor-pointer font-medium">
                      Prix négociable avec l'acquéreur
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Formulaire Location */}
            {showRental && (
              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/70 space-y-4">
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">Conditions de Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Loyer mensuel *" error={errors.rental?.rent_amount?.message}>
                    <Input type="number" placeholder="Ex: 350000" {...register('rental.rent_amount')} className="text-xs bg-white" />
                  </Field>
                  <Field label="Charges mensuelles" error={errors.rental?.charges_amount?.message}>
                    <Input type="number" defaultValue={0} {...register('rental.charges_amount')} className="text-xs bg-white" />
                  </Field>
                  <Field label="Dépôt de garantie" error={errors.rental?.deposit_amount?.message}>
                    <Input type="number" defaultValue={0} {...register('rental.deposit_amount')} className="text-xs bg-white" />
                  </Field>

                  <Field label="Mois d'avance" error={errors.rental?.advance_months?.message}>
                    <Input type="number" defaultValue={1} {...register('rental.advance_months')} className="text-xs bg-white" />
                  </Field>
                  <Field label="Durée min. bail (mois)" error={errors.rental?.min_lease_months?.message}>
                    <Input type="number" defaultValue={12} {...register('rental.min_lease_months')} className="text-xs bg-white" />
                  </Field>
                  <Field label="Disponible dès le" error={errors.rental?.available_from?.message}>
                    <Input type="date" {...register('rental.available_from')} className="text-xs bg-white" />
                  </Field>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/properties">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createProperty.isPending}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6 shadow-sm shadow-emerald-600/20"
          >
            {createProperty.isPending ? (
              <>
                <CgSpinner className="w-4 h-4 mr-2 animate-spin" /> Enregistrement en cours...
              </>
            ) : (
              'Créer et enregistrer le bien'
            )}
          </Button>
        </div>
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
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  )
}

export default PropertyNew
