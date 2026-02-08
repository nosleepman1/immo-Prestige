import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FiPlus,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiSend,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiAlertTriangle,
  FiLoader,
  FiGrid,
  FiList
} from 'react-icons/fi'
import { useMyProperties } from '@/hooks/properties/useMyProperties'
import { useUpdateProperty, useDeleteProperty } from '@/hooks/properties/usePropertyMutations'
import { usePropertyTypes, useDevises } from '@/hooks/properties/useReferenceData'
import { propertySchema, type PropertyFormSchemaValues } from '@/lib/schemas'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PropertyCard from './PropertyCard'
import {
  STATUS_LABELS,
  TRANSACTION_LABELS,
  headlinePrice,
  type Property
} from '@/types/property'

const STATUS_VARIANT: Record<string, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
}

const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount)

const ITEMS_PER_PAGE = 10

const PropertiesList: React.FC = () => {
  const navigate = useNavigate()
  const { data: properties, isLoading } = useMyProperties()

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  // Cards by default: an agent recognises their own property by its photo, not
  // by reading a title in a row. The table stays a click away for scanning many
  // listings at once.
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Modal States
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)

  const deleteMutation = useDeleteProperty()

  // Filtered & Paginated List
  const filteredProperties = useMemo(() => {
    if (!properties) return []
    return properties.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.region.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [properties, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE) || 1

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProperties, currentPage])

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in-50 duration-500 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Mes biens immobiliers</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Gérez votre catalogue de biens, modifiez leurs informations ou publiez-les directement sur le fil.
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20">
          <Link to="/properties/new">
            <FiPlus className="w-4 h-4 mr-1.5" /> Nouveau bien
          </Link>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <FiSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher par titre, ville, région..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9 text-xs border-slate-200"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FiFilter className="w-4 h-4 text-slate-400 shrink-0" />
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="text-xs border-slate-200 min-w-[140px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="archived">Archivés</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Affichage en cartes"
              aria-pressed={viewMode === 'grid'}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Affichage en tableau"
              aria-pressed={viewMode === 'table'}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="size-8 text-emerald-600" />
          <p className="text-xs font-medium text-slate-500">Chargement de votre catalogue de biens...</p>
        </div>
      ) : !paginatedProperties.length ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <FiHome className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-600">Aucun bien ne correspond à votre recherche.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginatedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={setEditingProperty}
                onDelete={setDeletingProperty}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">
                Page {currentPage} sur {totalPages} — {filteredProperties.length} biens au total
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  <FiChevronLeft className="w-3.5 h-3.5 mr-1" /> Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Suivant <FiChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-[110px] text-xs font-bold text-slate-700">Image</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Bien & Détails</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Ville</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Transaction</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Prix</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Statut</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProperties.map((property) => {
                const headline = headlinePrice(property)
                const cover = property.images?.find((img) => img.is_cover) || property.images?.[0]

                return (
                  <TableRow key={property.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Thumbnail Image on Left */}
                    <TableCell className="py-3">
                      <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                        {cover?.url ? (
                          <img src={cover.url} alt={property.name} className="w-full h-full object-cover" />
                        ) : (
                          <FiHome className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </TableCell>

                    {/* Bien & Type */}
                    <TableCell className="py-3">
                      <Link to={`/properties/${property.id}`} className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1">
                        {property.name}
                      </Link>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{property.property_type?.name || 'Immobilier'}</span>
                        {property.owner && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[130px]">Proprio: {property.owner.full_name}</span>
                          </>
                        )}
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="py-3 text-xs font-medium text-slate-700">
                      {property.city}
                    </TableCell>

                    {/* Transaction */}
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-[11px] font-semibold border-slate-200 bg-slate-50">
                        {TRANSACTION_LABELS[property.transaction_type]}
                      </Badge>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="py-3 text-xs font-bold text-emerald-800">
                      {headline ? (
                        <>
                          {formatAmount(headline.amount)} {property.devise?.code}
                          <span className="text-[10px] font-normal text-slate-500 block">{headline.suffix}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      <Badge variant={STATUS_VARIANT[property.status]} className="text-[10px] font-semibold">
                        {STATUS_LABELS[property.status]}
                      </Badge>
                    </TableCell>

                    {/* Action Buttons Right-Aligned */}
                    <TableCell className="py-3 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        {/* Publish Button */}
                        {property.status === 'draft' && (
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => navigate(`/properties/${property.id}`)}
                            title="Publier le bien"
                            className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <FiSend className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {/* View Details Icon */}
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => navigate(`/properties/${property.id}`)}
                          title="Voir les détails"
                          className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </Button>

                        {/* Edit Icon Button */}
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setEditingProperty(property)}
                          title="Modifier le bien"
                          className="w-7 h-7 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <FiEdit3 className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete Icon Button */}
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setDeletingProperty(property)}
                          title="Supprimer"
                          className="w-7 h-7 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <span className="text-xs text-slate-500 font-medium">
                Page {currentPage} sur {totalPages} — {filteredProperties.length} biens au total
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs gap-1"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" /> Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 text-xs gap-1"
                >
                  Suivant <FiChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal Component */}
      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          isOpen={!!editingProperty}
          onClose={() => setEditingProperty(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProperty && (
        <Dialog open={!!deletingProperty} onOpenChange={() => setDeletingProperty(null)}>
          <DialogContent showCloseButton={false} className="sm:max-w-md">
            <DialogHeader className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-center font-bold text-slate-900">Confirmer la suppression</DialogTitle>
              <DialogDescription className="text-center text-xs text-slate-500">
                Êtes-vous sûr de vouloir supprimer le bien <span className="font-semibold text-slate-800">"{deletingProperty.name}"</span> ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex gap-2 sm:justify-center mt-4">
              <Button variant="outline" size="sm" onClick={() => setDeletingProperty(null)}>
                Annuler
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(deletingProperty.id, {
                    onSuccess: () => setDeletingProperty(null),
                  })
                }}
              >
                {deleteMutation.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : 'Oui, supprimer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Edit Property Modal Form Component
// ---------------------------------------------------------------------------
function EditPropertyModal({
  property,
  isOpen,
  onClose,
}: {
  property: Property
  isOpen: boolean
  onClose: () => void
}) {
  const propertyTypes = usePropertyTypes()
  const devises = useDevises()
  const updateMutation = useUpdateProperty(property.id)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormSchemaValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property.name,
      property_type_id: property.property_type?.id,
      devise_id: property.devise?.id,
      owner_id: property.owner?.id,
      transaction_type: property.transaction_type,
      description: property.description || '',
      surface: property.surface,
      rooms: property.rooms,
      bedrooms: property.bedrooms || 0,
      country: property.country,
      region: property.region,
      city: property.city,
      sale: property.sale
        ? { price: property.sale.price, negotiable: property.sale.negotiable }
        : undefined,
      rental: property.rental
        ? {
            rent_amount: property.rental.rent_amount,
            charges_amount: property.rental.charges_amount,
            deposit_amount: property.rental.deposit_amount,
            advance_months: property.rental.advance_months,
            min_lease_months: property.rental.min_lease_months,
            available_from: property.rental.available_from || undefined,
          }
        : undefined,
    },
  })

  const transactionType = useWatch({ control, name: 'transaction_type' })
  const showSale = transactionType !== 'rent'
  const showRental = transactionType !== 'sale'

  const onSubmit = handleSubmit((values) => {
    updateMutation.mutate(
      {
        ...values,
        sale: showSale ? values.sale : undefined,
        rental: showRental ? values.rental : undefined,
      },
      {
        onSuccess: () => onClose(),
      }
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">Modifier le bien #{property.id}</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">Mettez à jour les informations du bien.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Titre" error={errors.name?.message} className="sm:col-span-2">
              <Input {...register('name')} className="text-xs" />
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
                    <SelectTrigger className="text-xs">
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

            <Field label="Superficie (m²)" error={errors.surface?.message}>
              <Input type="number" step="0.01" {...register('surface')} className="text-xs" />
            </Field>
            <Field label="Pièces" error={errors.rooms?.message}>
              <Input type="number" {...register('rooms')} className="text-xs" />
            </Field>

            <Field label="Ville" error={errors.city?.message}>
              <Input {...register('city')} className="text-xs" />
            </Field>
            <Field label="Région" error={errors.region?.message}>
              <Input {...register('region')} className="text-xs" />
            </Field>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" size="sm" disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {updateMutation.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <div className={`space-y-1 ${className ?? ''}`}>
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </div>
  )
}

export default PropertiesList
