import { useParams, Link } from 'react-router-dom'
import { useRef } from 'react'
import { ArrowLeft, Star, Trash2, Upload, ArrowUp, ArrowDown } from 'lucide-react'
import { useProperty } from '@/hooks/properties/useProperty'
import { usePublishProperty, useDeleteProperty } from '@/hooks/properties/usePropertyMutations'
import {
  useUploadPropertyImage,
  useSetCoverImage,
  useDeletePropertyImage,
  useReorderPropertyImages,
} from '@/hooks/properties/usePropertyImages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useNavigate } from 'react-router-dom'

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
      <div className="flex justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!property) return <p className="text-center py-16 text-muted-foreground">Bien introuvable.</p>

  const images = [...property.images].sort((a, b) => a.position - b.position)

  const move = (index: number, direction: -1 | 1) => {
    const next = [...images]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    reorder.mutate(next.map((img) => img.id))
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link to="/properties" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Retour aux biens
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{property.name}</h1>
          <p className="text-muted-foreground text-sm">
            {property.city}, {property.region}
          </p>
        </div>
        <Badge variant={property.status === 'published' ? 'default' : 'secondary'}>{property.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Prix</div>
            <div>
              {new Intl.NumberFormat('fr-FR').format(property.price)} {property.devise?.code}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Superficie</div>
            <div>{property.surface} m²</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Pièces / Chambres</div>
            <div>
              {property.rooms} / {property.bedrooms ?? '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Type</div>
            <div>{property.property_type?.name}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Images</CardTitle>
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
            <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()} disabled={uploadImage.isPending}>
              <Upload className="size-4 mr-1" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Aucune image.</p>}
          {images.map((image, index) => (
            <div key={image.id} className="relative rounded-lg overflow-hidden ring-1 ring-border">
              <img src={image.url} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-1">
                <button
                  type="button"
                  onClick={() => setCover.mutate(image.id)}
                  className={`p-1 rounded ${image.is_cover ? 'text-yellow-400' : 'text-white'}`}
                  title="Définir comme couverture"
                >
                  <Star className="size-4" fill={image.is_cover ? 'currentColor' : 'none'} />
                </button>
                <div className="flex gap-0.5">
                  <button type="button" onClick={() => move(index, -1)} className="p-1 text-white" title="Monter">
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} className="p-1 text-white" title="Descendre">
                    <ArrowDown className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => deleteImage.mutate(image.id)}
                  className="p-1 text-white"
                  title="Supprimer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {property.status === 'draft' && (
          <Button onClick={() => publish.mutate()} disabled={publish.isPending}>
            Publier sur le fil d'actualité
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={() => remove.mutate(property.id, { onSuccess: () => navigate('/properties') })}
          disabled={remove.isPending}
        >
          Supprimer le bien
        </Button>
      </div>
    </div>
  )
}

export default PropertyDetail
