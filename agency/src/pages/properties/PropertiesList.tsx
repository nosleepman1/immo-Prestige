import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useMyProperties } from '@/hooks/properties/useMyProperties'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const STATUS_VARIANT: Record<string, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
}

const PropertiesList = () => {
  const { data: properties, isLoading } = useMyProperties()

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes biens</h1>
          <p className="text-muted-foreground text-sm">Catalogue de vos annonces immobilières</p>
        </div>
        <Button asChild>
          <Link to="/properties/new">
            <Plus className="size-4 mr-1" /> Nouveau bien
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : !properties?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Aucun bien pour le moment.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bien</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>
                  <Link to={`/properties/${property.id}`} className="font-medium hover:underline">
                    {property.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{property.property_type?.name}</div>
                </TableCell>
                <TableCell>{property.city}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('fr-FR').format(property.price)} {property.devise?.code}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[property.status]}>{property.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default PropertiesList
