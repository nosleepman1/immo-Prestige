import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Building2, Plus, Search, Edit, Trash2, MapPin, Maximize, Bed, ChevronLeft, ChevronRight } from 'lucide-react';

 function PropertyList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, propertyId: null });
  
  // ========== PAGINATION ==========
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 1000,
    per_page: 15,
    current_page: 1,
    last_page: 67,
    from: 1,
    to: 15
  });
  // ================================

  // ========== DONNÉES SIMULÉES - À REMPLACER PAR APPEL API ==========
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: 'Magnifique villa moderne avec piscine',
      type: 'Villa',
      transaction_type: 'Vente',
      surface: 250,
      rooms: 6,
      bedrooms: 4,
      price: 350000,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Almadies',
      address: '12 Avenue des Almadies',
      is_available: true,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80'
    },
    {
      id: 2,
      title: 'Appartement standing centre-ville',
      type: 'Appartement',
      transaction_type: 'Location',
      surface: 85,
      rooms: 3,
      bedrooms: 2,
      price: 750,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Plateau',
      address: '45 Rue Mohamed V',
      is_available: true,
      image: 'https://images.unsplash.com/photo-1502672260066-6bc985ed8bff?w=400&q=80'
    },
    {
      id: 3,
      title: 'Studio meublé proche université',
      type: 'Studio',
      transaction_type: 'Location',
      surface: 35,
      rooms: 1,
      bedrooms: 1,
      price: 300,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Fann',
      address: '8 Rue de la Liberté',
      is_available: false,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80'
    },
    {
      id: 4,
      title: 'Maison familiale avec jardin spacieux',
      type: 'Maison',
      transaction_type: 'Vente',
      surface: 180,
      rooms: 5,
      bedrooms: 3,
      price: 185000,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Ouakam',
      address: '23 Route de Ouakam',
      is_available: true,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80'
    },
    {
      id: 5,
      title: 'Appartement 2 pièces lumineux',
      type: 'Appartement',
      transaction_type: 'Location',
      surface: 65,
      rooms: 2,
      bedrooms: 1,
      price: 550,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Mermoz',
      address: '15 Rue Mermoz',
      is_available: true,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80'
    },
    {
      id: 6,
      title: 'Villa de luxe vue mer',
      type: 'Villa',
      transaction_type: 'Vente',
      surface: 320,
      rooms: 8,
      bedrooms: 5,
      price: 580000,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Ngor',
      address: '7 Corniche de Ngor',
      is_available: true,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80'
    },
    {
      id: 7,
      title: 'Bureau moderne 100m²',
      type: 'Bureau',
      transaction_type: 'Location',
      surface: 100,
      rooms: 4,
      bedrooms: 0,
      price: 1200,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Plateau',
      address: '28 Avenue Pompidou',
      is_available: true,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80'
    },
    {
      id: 8,
      title: 'Duplex contemporain avec terrasse',
      type: 'Appartement',
      transaction_type: 'Vente',
      surface: 120,
      rooms: 4,
      bedrooms: 3,
      price: 225000,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Point E',
      address: '42 Rue Point E',
      is_available: true,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80'
    },
    {
      id: 9,
      title: 'Terrain constructible 500m²',
      type: 'Terrain',
      transaction_type: 'Vente',
      surface: 500,
      rooms: 0,
      bedrooms: 0,
      price: 95000,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Yoff',
      address: 'Zone résidentielle Yoff',
      is_available: true,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80'
    },
    {
      id: 10,
      title: 'Loft industriel rénové',
      type: 'Loft',
      transaction_type: 'Location',
      surface: 95,
      rooms: 2,
      bedrooms: 1,
      price: 850,
      devise_symbol: '€',
      city: 'Dakar',
      region: 'Médina',
      address: '18 Rue de la Médina',
      is_available: true,
      image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&q=80'
    }
  ]);

  // ========== FONCTION POUR CHARGER LES BIENS AVEC PAGINATION (À IMPLÉMENTER) ==========
  // useEffect(() => {
  //   const fetchProperties = async () => {
  //     try {
  //       const params = new URLSearchParams({
  //         page: currentPage,
  //         per_page: 15,
  //         search: searchTerm,
  //         transaction_type: filterType !== 'all' ? filterType : ''
  //       });
  //       
  //       const response = await fetch(`/api/biens?${params}`, {
  //         headers: {
  //           'Authorization': `Bearer ${token}`
  //         }
  //       });
  //       const data = await response.json();
  //       
  //       setProperties(data.data);
  //       setPagination({
  //         total: data.total,
  //         per_page: data.per_page,
  //         current_page: data.current_page,
  //         last_page: data.last_page,
  //         from: data.from,
  //         to: data.to
  //       });
  //     } catch (error) {
  //       console.error('Erreur:', error);
  //     }
  //   };
  //   fetchProperties();
  // }, [currentPage, searchTerm, filterType]);
  // ====================================================================================

  const handleAdd = () => {
    console.log('Redirection vers le formulaire d\'ajout');
  };

  const handleEdit = (propertyId) => {
    console.log('Modifier le bien:', propertyId);
  };

  const handleDelete = async (propertyId) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setDeleteDialog({ open: false, propertyId: null });
    console.log('Bien supprimé:', propertyId);
  };

  const openDeleteDialog = (propertyId) => {
    setDeleteDialog({ open: true, propertyId });
  };

  // ========== PAGINATION HANDLERS ==========
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const current = pagination.current_page;
    const last = pagination.last_page;
    
    if (last <= 7) {
      for (let i = 1; i <= last; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(last);
      } else if (current >= last - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = last - 4; i <= last; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(last);
      }
    }
    return pages;
  };
  // =========================================

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mes biens immobiliers</h1>
                <p className="text-sm text-muted-foreground">{pagination.total} biens au total</p>
              </div>
            </div>
            <Button onClick={handleAdd} className="h-10 px-4 gap-2">
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                className="h-10"
                size="sm"
              >
                Tous
              </Button>
              <Button
                variant={filterType === 'vente' ? 'default' : 'outline'}
                onClick={() => setFilterType('vente')}
                className="h-10"
                size="sm"
              >
                Vente
              </Button>
              <Button
                variant={filterType === 'location' ? 'default' : 'outline'}
                onClick={() => setFilterType('location')}
                className="h-10"
                size="sm"
              >
                Location
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Property List */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-md transition">
              <div className="flex gap-4 p-4">
                {/* Miniature Image */}
                <div className="relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {!property.is_available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Indisponible</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">{property.title}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <MapPin className="w-3 h-3" />
                          <span>{property.address}, {property.city}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                          {property.transaction_type}
                        </div>
                        <div className="px-2 py-1 bg-muted text-xs font-medium rounded">
                          {property.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{property.surface} m²</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{property.rooms} pièces</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{property.bedrooms} chambres</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {property.price.toLocaleString()} {property.devise_symbol}
                      </p>
                      {property.transaction_type === 'Location' && (
                        <p className="text-xs text-muted-foreground">par mois</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(property.id)}
                        className="h-9 w-9 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(property.id)}
                        className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {pagination.from} à {pagination.to} sur {pagination.total} biens
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2">...</span>
              ) : (
                <Button
                  key={page}
                  variant={pagination.current_page === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className="h-9 w-9 p-0"
                >
                  {page}
                </Button>
              )
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, propertyId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteDialog.propertyId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PropertyList;