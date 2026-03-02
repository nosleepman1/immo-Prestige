import { useState, useMemo, useContext } from "react";
import { Loader, Building2, MapPin, ListPlus, CheckSquare, Save, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import usePropertyTypes from "../../hooks/property/usePropertyTypes";
import useDevises from "../../hooks/property/useDevises";
import COUNTRIES from "../../data/countries";
import { AuthContext } from "@/context/AuthContext";
import usePostProperty from "@/hooks/property/usePostProperty";

// Mock Agencies since it's a foreign key



export default function AddProperty() {


  const navigate = useNavigate();


  const { propertyTypes } = usePropertyTypes() || {};
  const { devises, loadingDevises } = useDevises() || {};
  const {newProperty, loading, errors} = usePostProperty() || {};
  const {user, token} = useContext(AuthContext) || {};

 

  const [formData, setFormData] = useState({
    name: "",
    property_type_id: "",
    agency_id: user.agency.id,
    devise_id: "",
    price: "",
    surface: "",
    rooms: "",
    bedrooms: "",
    floor: "",
    country: "",
    region: "dakar",
    address: "",
    description: "",
    furnished: false,
    is_active: true,
  });

  const availableCities = useMemo(() => {
    const countryObj = COUNTRIES.find((c) => c.name === formData.country);
    return countryObj ? countryObj.cities : [];
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();

     newProperty(formData, token)
      .then(() => {
        navigate('/properties')
      })
  

  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const selectClass =
    "w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer";
  const labelClass = "block text-sm font-semibold mb-1.5 text-foreground/90";

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux biens
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Ajouter un bien
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Remplissez les informations ci-dessous.
            </p>
            {errors && (<p>{errors.message}</p>)}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-border">

            {/* Section 1: General Info */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <ListPlus className="h-5 w-5" />
                <h2 className="text-lg font-bold text-foreground">Informations Générales</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className={labelClass}>Titre du bien *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="ex: Villa de luxe aux Almadies"
                    className={inputClass}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="property_type_id" className={labelClass}>Type de bien *</label>
                  <div className="relative">
                    <select
                      id="property_type_id"
                      name="property_type_id"
                      required
                      className={selectClass}
                      value={formData.property_type_id}
                      onChange={handleChange}
                    >
                      <option value="" disabled>Sélectionner un type</option>
                      {propertyTypes && propertyTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>



                <div>
                  <label htmlFor="price" className={labelClass}>Prix *</label>
                  <div className="relative">
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      required
                      placeholder="ex: 15000000"
                      className={inputClass}
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="devise_id" className={labelClass}>Devise</label>
                  <select
                    id="devise_id"
                    name="devise_id"
                    className={selectClass}
                    value={formData.devise_id}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Sélectionner (optionnel)</option>
                    {loadingDevises ? <option value="">Chargement ....</option> : devises && devises.map((devise) => (
                      <option key={devise.id} value={devise.id}>{devise.name}</option>
                    ))}


                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Details */}
            <div className="p-6 md:p-8 space-y-6 bg-muted/10">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Building2 className="h-5 w-5" />
                <h2 className="text-lg font-bold text-foreground">Caractéristiques</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="surface" className={labelClass}>Surface (m²) *</label>
                  <input
                    id="surface"
                    name="surface"
                    type="number"
                    min="1"
                    required
                    className={inputClass}
                    value={formData.surface}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="rooms" className={labelClass}>Pièces *</label>
                  <input
                    id="rooms"
                    name="rooms"
                    type="number"
                    min="1"
                    required
                    className={inputClass}
                    value={formData.rooms}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="bedrooms" className={labelClass}>Chambres</label>
                  <input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    className={inputClass}
                    value={formData.bedrooms}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="floor" className={labelClass}>Étage</label>
                  <input
                    id="floor"
                    name="floor"
                    type="number"
                    className={inputClass}
                    value={formData.floor}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>Description détaillée</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Décrivez les atouts de ce bien..."
                  className={`${inputClass} resize-y`}
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Section 3: Location */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <MapPin className="h-5 w-5" />
                <h2 className="text-lg font-bold text-foreground">Localisation</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="country" className={labelClass}>Pays *</label>
                  <select
                    id="country"
                    name="country"
                    required
                    className={selectClass}
                    value={formData.country}
                    onChange={(e) => {
                      handleChange(e);
                      // Reset city when country changes
                      setFormData((prev) => ({ ...prev, city: "" }));
                    }}
                  >
                    <option value="" disabled>Sélectionner un pays</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className={labelClass}>Ville *</label>
                  <select
                    id="city"
                    name="city"
                    required
                    className={selectClass}
                    value={formData.region}
                    onChange={handleChange}
                    disabled={!formData.country}
                  >
                    <option value="" disabled>Sélectionner une ville</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className={labelClass}>Adresse complète *</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    placeholder="ex: 12 Rue des Almadies"
                    className={inputClass}
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Status / Flags */}
            <div className="p-6 md:p-8 bg-muted/10">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <CheckSquare className="h-5 w-5" />
                <h2 className="text-lg font-bold text-foreground">Options & Statut</h2>
              </div>

              <div className="flex flex-wrap gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      name="furnished"
                      className="peer sr-only"
                      checked={formData.furnished}
                      onChange={handleChange}
                    />
                    <div className="h-6 w-6 rounded-md border-2 border-muted-foreground/30 bg-background peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <CheckSquare className="absolute text-primary-foreground opacity-0 peer-checked:opacity-100 h-4 w-4 transition-opacity pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Bien meublé</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      className="peer sr-only"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <div className="h-6 w-6 rounded-md border-2 border-muted-foreground/30 bg-background peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <CheckSquare className="absolute text-primary-foreground opacity-0 peer-checked:opacity-100 h-4 w-4 transition-opacity pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Visible (Actif)</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 md:p-8 flex items-center justify-end gap-3 bg-muted/20 border-t border-border mt-auto">
              <button
                type="button"
                onClick={() => navigate("/properties")}
                className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className={`cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save className="" />
                {loading ? "Enregistrement en cours..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}