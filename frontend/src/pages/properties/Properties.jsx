import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import { PROPERTIES } from "@/data/properties";
import { PropertyCard } from "@/components/properties/PropertyCard";

const Properties = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestion des biens
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {PROPERTIES.length} biens enregistrés
          </p>
        </div>

        <Button
          onClick={() => navigate("/properties/new")}
          className="gap-2 btn btn-primary border-2 border-border shadow-md"
        >
          <Plus className="h-4 w-4" />
          Ajouter un bien
        </Button>
      </div>

      {/* Grid */}
      {PROPERTIES.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 py-24">
          <Building2 className="h-12 w-12 opacity-30" />
          <p className="text-lg font-medium">Aucun bien trouvé</p>
          <p className="text-sm">Commencez par en ajouter un !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PROPERTIES.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;