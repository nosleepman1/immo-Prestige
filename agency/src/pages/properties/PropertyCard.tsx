import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiEdit3,
  FiEye,
  FiHome,
  FiMapPin,
  FiSend,
  FiTrash2,
  FiUser,
  FiMaximize,
} from 'react-icons/fi'
import { LuBedDouble, LuSofa } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import {
  AVAILABILITY_LABELS,
  STATUS_LABELS,
  TRANSACTION_LABELS,
  headlinePrice,
  type Property,
  type PropertyAvailability,
  type PropertyStatus,
} from '@/types/property'

const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount)

/** Draft is the one that needs an action, so it is the one that stands out. */
const STATUS_STYLE: Record<PropertyStatus, string> = {
  draft: 'bg-amber-100 text-amber-800 border-amber-200',
  published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',
}

const AVAILABILITY_STYLE: Record<PropertyAvailability, string> = {
  available: 'bg-white/90 text-emerald-800',
  reserved: 'bg-white/90 text-amber-800',
  sold: 'bg-slate-900/85 text-white',
  rented: 'bg-slate-900/85 text-white',
}

/**
 * A listing as a card: the photo first, because that is what an agent
 * recognises their own property by — a row of text makes them read the title to
 * find the one they meant.
 */
export const PropertyCard: React.FC<{
  property: Property
  onEdit: (property: Property) => void
  onDelete: (property: Property) => void
}> = ({ property, onEdit, onDelete }) => {
  const cover = property.images?.find((image) => image.is_cover) ?? property.images?.[0]
  const headline = headlinePrice(property)

  return (
    <article className="group bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <Link to={`/properties/${property.id}`} className="relative block aspect-[4/3] bg-slate-100 overflow-hidden">
        {cover?.url ? (
          <img
            src={cover.url}
            alt={property.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <FiHome className="w-10 h-10" />
          </div>
        )}

        {/* Gradient so the pills stay legible over a bright photo. */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/55 to-transparent" />

        <span
          className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLE[property.status]}`}
        >
          {STATUS_LABELS[property.status]}
        </span>

        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${AVAILABILITY_STYLE[property.availability]}`}
        >
          {AVAILABILITY_LABELS[property.availability]}
        </span>

        {headline && (
          <div className="absolute bottom-3 left-3 text-white">
            <span className="text-lg font-bold tracking-tight drop-shadow-sm">
              {formatAmount(headline.amount)} {property.devise?.code}
            </span>
            <span className="text-[11px] font-medium opacity-90">{headline.suffix}</span>
          </div>
        )}

        <span className="absolute bottom-3 right-3 text-[10px] font-semibold text-white/95 bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
          {TRANSACTION_LABELS[property.transaction_type]}
        </span>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <Link
            to={`/properties/${property.id}`}
            className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
          >
            {property.name}
          </Link>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <FiMapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {property.city}, {property.region}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Spec icon={<FiMaximize className="w-3 h-3" />} label={`${property.surface} m²`} />
          <Spec icon={<FiHome className="w-3 h-3" />} label={`${property.rooms} pièces`} />
          {property.bedrooms != null && (
            <Spec icon={<LuBedDouble className="w-3 h-3" />} label={`${property.bedrooms} ch.`} />
          )}
          {property.furnished && <Spec icon={<LuSofa className="w-3 h-3" />} label="Meublé" />}
        </div>

        {property.owner && (
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
            <FiUser className="w-3 h-3 shrink-0 text-slate-400" />
            {property.owner.full_name}
          </p>
        )}

        <div className="flex items-center gap-1 pt-2 mt-auto border-t border-slate-100">
          {property.status === 'draft' && (
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 h-8 px-2"
              title="Publier le bien"
            >
              <Link to={`/properties/${property.id}`}>
                <FiSend className="w-3.5 h-3.5 mr-1" /> Publier
              </Link>
            </Button>
          )}

          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-[11px] font-semibold text-slate-600 hover:bg-slate-100 h-8 px-2"
            title="Voir les détails"
          >
            <Link to={`/properties/${property.id}`}>
              <FiEye className="w-3.5 h-3.5 mr-1" /> Détails
            </Link>
          </Button>

          <div className="ml-auto flex items-center gap-0.5">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => onEdit(property)}
              title="Modifier le bien"
              className="w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => onDelete(property)}
              title="Supprimer"
              className="w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-50"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-1 rounded-lg">
      {icon}
      {label}
    </span>
  )
}

export default PropertyCard
