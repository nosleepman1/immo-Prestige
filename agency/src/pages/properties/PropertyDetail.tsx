import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import {
  ArrowLeft,
  Star,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  Building2,
  MapPin,
  Tag,
  CheckCircle2,
  User,
  Phone,
  Euro,
  Maximize2,
  BedDouble,
  Home,
  Sparkles,
  Layers,
  Calendar,
  ShieldCheck
} from 'lucide-react'
import { useProperty } from '@/hooks/properties/useProperty'
import { usePublishProperty, useDeleteProperty } from '@/hooks/properties/usePropertyMutations'
import {
  useUploadPropertyImage,
  useSetCoverImage,
  useDeletePropertyImage,
  useReorderPropertyImages,
} from '@/hooks/properties/usePropertyImages'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { AVAILABILITY_LABELS, TRANSACTION_LABELS } from '@/types/property'

const money = (amount: number, currency?: string) =>
  `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency ?? 'XOF'}`

function MetricCard({
  icon: Icon,
  label,
  value,
  subvalue,
  accent = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  subvalue?: string
  accent?: boolean
}) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        accent
          ? 'bg-emerald-50/60 border-emerald-200/80'
          : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            accent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-base font-bold tracking-tight ${accent ? 'text-emerald-900' : 'text-slate-900'}`}>
        {value}
      </div>
      {subvalue && <div className="text-xs text-slate-500 mt-0.5">{subvalue}</div>}
    </div>
  )
}

const PropertyDetail = () => {
  const { id } = useParams()
  const propertyId = Number(id)
  const { data: property, isLoading } = useProperty(propertyId)
  const publish = usePublishProperty(propertyId)
  const remove = useDeleteProperty()
  const uploadImage = useUploadPropertyImage(propertyId)
  const setCover = useSetCoverImage(propertyId)
  const deleteImage = useDeletePropertyImage(propertyId)
  const reorder = useReorderPropertyImages(propertyId)
  const fileInput = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="size-8 text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Chargement de la fiche du bien...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Bien introuvable</h2>
        <p className="text-sm text-slate-500">Ce bien n'existe plus ou a été retiré du catalogue.</p>
        <Link to="/properties">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la liste
          </Button>
        </Link>
      </div>
    )
  }

  const images = [...property.images].sort((a, b) => a.position - b.position)

  const move = (index: number, direction: -1 | 1) => {
    const next = [...images]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    reorder.mutate(next.map((img) => img.id))
  }

  const mainPrice = property.sale
    ? money(property.sale.price, property.devise?.code)
    : property.rental
    ? money(property.rental.rent_amount, property.devise?.code)
    : 'Sur demande'

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-16">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux biens
        </Link>

        <div className="flex items-center gap-3">
          {property.status === 'draft' && (
            <Button
              onClick={() => publish.mutate()}
              disabled={publish.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" /> Publier le bien
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => remove.mutate(property.id, { onSuccess: () => navigate('/properties') })}
            disabled={remove.isPending}
            className="border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 text-xs gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </Button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-md p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold px-2.5 py-0.5">
                {TRANSACTION_LABELS[property.transaction_type]}
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50 font-medium">
                {AVAILABILITY_LABELS[property.availability]}
              </Badge>
              <Badge
                className={
                  property.status === 'published'
                    ? 'bg-teal-500 text-white font-semibold'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }
              >
                {property.status === 'published' ? 'En ligne' : 'Brouillon'}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              {property.name}
            </h1>

            <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {property.city}, {property.region} — {property.country}
              </span>
            </div>
          </div>

          <div className="md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl border md:border-0 border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {property.transaction_type === 'rent' ? 'Loyer Mensuel' : 'Prix de Vente'}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight font-heading">
              {mainPrice}
            </span>
            {property.rental && property.rental.charges_amount > 0 && (
              <span className="text-xs text-slate-500 block mt-0.5">
                + {money(property.rental.charges_amount, property.devise?.code)} charges
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout: Key Features & Owner Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Tech Metrics & Financial Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Characteristics */}
          <Card className="border-slate-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" /> Caractéristiques Générales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard icon={Maximize2} label="Surface" value={`${property.surface} m²`} />
                <MetricCard icon={Home} label="Pièces" value={`${property.rooms}`} />
                <MetricCard icon={BedDouble} label="Chambres" value={`${property.bedrooms ?? '0'}`} />
                <MetricCard icon={Tag} label="Type" value={property.property_type?.name || 'Immobilier'} />
              </div>

              {property.description && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Conditions Breakdown */}
          {property.sale && (
            <Card className="border-slate-200/80 shadow-xs bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Euro className="w-4 h-4 text-emerald-600" /> Conditions de Vente
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <MetricCard icon={Euro} label="Prix Demande" value={money(property.sale.price, property.devise?.code)} accent />
                <MetricCard
                  icon={CheckCircle2}
                  label="Prix Négociable"
                  value={property.sale.negotiable ? 'Oui' : 'Non'}
                />
              </CardContent>
            </Card>
          )}

          {property.rental && (
            <Card className="border-slate-200/80 shadow-xs bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Euro className="w-4 h-4 text-emerald-600" /> Conditions Financières de Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard icon={Euro} label="Loyer HC" value={money(property.rental.rent_amount, property.devise?.code)} />
                  <MetricCard icon={Euro} label="Charges" value={money(property.rental.charges_amount, property.devise?.code)} />
                  <MetricCard icon={Euro} label="Total Mensuel" value={money(property.rental.monthly_total, property.devise?.code)} accent />
                  <MetricCard icon={ShieldCheck} label="Dépôt Garantie" value={money(property.rental.deposit_amount, property.devise?.code)} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <MetricCard icon={Layers} label="Mois d'avance" value={`${property.rental.advance_months} mois`} />
                  <MetricCard icon={Calendar} label="Bail Minimum" value={`${property.rental.min_lease_months} mois`} />
                  <MetricCard
                    icon={Sparkles}
                    label="Coût Entrée Est."
                    value={money(property.rental.move_in_cost, property.devise?.code)}
                    accent
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (1 col): Owner & Agency Mandate */}
        <div className="space-y-6">
          {property.owner ? (
            <Card className="border-slate-200/80 shadow-xs bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" /> Mandat Propriétaire
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">Informations de contact confidentielles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    {property.owner.full_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{property.owner.full_name}</h4>
                    <span className="text-xs text-slate-500">Propriétaire bailleur</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{property.owner.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200/80 shadow-xs bg-white p-6 text-center space-y-2">
              <User className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-500">Aucun propriétaire rattaché directement à ce bien.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      <Card className="border-slate-200/80 shadow-xs bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 font-heading">Galerie d'Images ({images.length})</CardTitle>
            <CardDescription className="text-xs text-slate-500">Gérez les photos du bien, l'image de couverture et l'ordre d'affichage</CardDescription>
          </div>
          <div>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadImage.mutate(file)
                e.target.value = ''
              }}
            />
            <Button
              size="sm"
              onClick={() => fileInput.current?.click()}
              disabled={uploadImage.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-emerald-600/20"
            >
              <Upload className="w-4 h-4" /> Ajouter une photo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-3">
              <Upload className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Aucune image téléversée pour ce bien.</p>
              <Button size="xs" variant="outline" onClick={() => fileInput.current?.click()}>
                Téléverser la première photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`group relative rounded-xl overflow-hidden border transition-all ${
                    image.is_cover
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <img src={image.url} alt="" className="w-full h-44 object-cover" />

                  {image.is_cover && (
                    <Badge className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                      <Star className="w-3 h-3 mr-1 fill-white" /> Image de couverture
                    </Badge>
                  )}

                  {/* Image Controls Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent p-2.5 flex items-center justify-between opacity-95 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setCover.mutate(image.id)}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        image.is_cover
                          ? 'bg-amber-400 text-slate-900'
                          : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs'
                      }`}
                      title="Définir comme couverture"
                    >
                      <Star className="w-3 h-3" fill={image.is_cover ? 'currentColor' : 'none'} />
                      {image.is_cover ? 'Couverture' : 'Def. Couverture'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 rounded-md bg-white/20 text-white hover:bg-white/30 disabled:opacity-30 backdrop-blur-xs"
                        title="Déplacer vers la gauche/haut"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === images.length - 1}
                        className="p-1.5 rounded-md bg-white/20 text-white hover:bg-white/30 disabled:opacity-30 backdrop-blur-xs"
                        title="Déplacer vers la droite/bas"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteImage.mutate(image.id)}
                        className="p-1.5 rounded-md bg-rose-600/80 text-white hover:bg-rose-600 backdrop-blur-xs"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PropertyDetail
