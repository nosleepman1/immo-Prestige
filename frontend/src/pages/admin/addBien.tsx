import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, MapPin, DollarSign, Home, Bed, Maximize, Layers, Upload, X, Check } from 'lucide-react';

function PropertyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type_bien_id: '',
    surface: '',
    rooms: '',
    bedrooms: '',
    floor: '',
    furnished: false,
    price: '',
    devise_id: '',
    transaction_type_id: '',
    address: '',
    country: '',
    region: '',
    city: '',
    postal_code: '',
    latitude: '',
    longitude: '',
    is_available: true
  });

  const [images, setImages] = useState([]);

  // ========== API DATA - À REMPLACER PAR VOS APPELS API ==========
  const [typeBiens, setTypeBiens] = useState([
    { id: 1, name: 'Appartement' },
    { id: 2, name: 'Maison' },
    { id: 3, name: 'Villa' },
    { id: 4, name: 'Studio' },
    { id: 5, name: 'Terrain' }
  ]);

  const [devises, setDevises] = useState([
    { id: 1, code: 'EUR', symbol: '€' },
    { id: 2, code: 'USD', symbol: '$' },
    { id: 3, code: 'XOF', symbol: 'FCFA' }
  ]);

  const [transactionTypes, setTransactionTypes] = useState([
    { id: 1, name: 'Vente' },
    { id: 2, name: 'Location' }
  ]);

  //usefect API call 


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  
  const handleSubmit = async () => {
    
    const submitData = new FormData();
    

    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    // Ajouter les images
    images.forEach((image, index) => {
      submitData.append(`images[${index}]`, image);
    });

    // Exemple d'appel API
    // try {
    //   const response = await fetch('/api/biens', {
    //     method: 'POST',
    //     body: submitData,
    //     headers: {
    //       'Authorization': `Bearer ${token}`
    //     }
    //   });
    //   
    //   if (response.ok) {
    //     const result = await response.json();
    //     console.log('Bien créé:', result);
    //     // Redirection ou notification de succès
    //   }
    // } catch (error) {
    //   console.error('Erreur:', error);
    //   // Afficher une notification d'erreur
    // }

    console.log('Données à envoyer:', formData);
    console.log('Images:', images);
  };
  // ============================================================

  const steps = [
    { id: 1, title: 'Informations', icon: Home },
    { id: 2, title: 'Caractéristiques', icon: Maximize },
    { id: 3, title: 'Prix & Localisation', icon: MapPin },
    { id: 4, title: 'Photos', icon: Layers }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Nouveau bien immobilier</h1>
              <p className="text-muted-foreground">Complétez les informations pour publier votre bien</p>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-4 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`flex items-center gap-3 flex-1 p-4 rounded-lg border-2 transition ${
                    currentStep === step.id 
                      ? 'border-primary bg-primary/5' 
                      : currentStep > step.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : 'border-border'
                  }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      currentStep === step.id 
                        ? 'bg-primary text-primary-foreground' 
                        : currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-muted'
                    }`}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Étape {step.id}</p>
                      <p className="font-semibold text-sm">{step.title}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-8">
            {/* Step 1: Informations générales */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="title">Titre de l'annonce</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Ex: Magnifique villa avec piscine"
                      value={formData.title}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Décrivez votre bien en détail..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type_bien_id">Type de bien</Label>
                    <select
                      id="type_bien_id"
                      name="type_bien_id"
                      value={formData.type_bien_id}
                      onChange={handleChange}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Sélectionner un type</option>
                      {typeBiens.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transaction_type_id">Type de transaction</Label>
                    <select
                      id="transaction_type_id"
                      name="transaction_type_id"
                      value={formData.transaction_type_id}
                      onChange={handleChange}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Sélectionner</option>
                      {transactionTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Caractéristiques */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="surface">Surface (m²)</Label>
                    <Input
                      id="surface"
                      name="surface"
                      type="number"
                      placeholder="120"
                      value={formData.surface}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rooms">Nombre de pièces</Label>
                    <Input
                      id="rooms"
                      name="rooms"
                      type="number"
                      placeholder="4"
                      value={formData.rooms}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Chambres</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      placeholder="3"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor">Étage</Label>
                    <Input
                      id="floor"
                      name="floor"
                      type="number"
                      placeholder="2"
                      value={formData.floor}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="col-span-2 flex items-end">
                    <label className="flex items-center gap-3 h-12 px-4 rounded-md border border-input bg-background cursor-pointer hover:bg-accent transition">
                      <input
                        type="checkbox"
                        id="furnished"
                        name="furnished"
                        checked={formData.furnished}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">Bien meublé</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Prix & Localisation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="250000"
                      value={formData.price}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="devise_id">Devise</Label>
                    <select
                      id="devise_id"
                      name="devise_id"
                      value={formData.devise_id}
                      onChange={handleChange}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Sélectionner</option>
                      {devises.map(devise => (
                        <option key={devise.id} value={devise.id}>
                          {devise.code} ({devise.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address">Adresse complète</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="12 Avenue des Champs-Élysées"
                      value={formData.address}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Dakar"
                      value={formData.city}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Code postal</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      placeholder="10000"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Région</Label>
                    <Input
                      id="region"
                      name="region"
                      placeholder="Dakar"
                      value={formData.region}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="Sénégal"
                      value={formData.country}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      placeholder="14.6928"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      placeholder="-17.4467"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photos */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-12 text-center bg-muted/30 hover:bg-muted/50 transition cursor-pointer">
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="images" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">Cliquez pour ajouter des photos</p>
                    <p className="text-sm text-muted-foreground">ou glissez-déposez vos fichiers ici</p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-3 p-4 rounded-lg border border-input bg-background cursor-pointer hover:bg-accent transition">
                  <input
                    type="checkbox"
                    id="is_available"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Bien disponible immédiatement</span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8 border-t mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="h-12 px-8"
                >
                  Précédent
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="h-12 px-8 ml-auto"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="h-12 px-8 ml-auto"
                >
                  Publier le bien
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PropertyForm;