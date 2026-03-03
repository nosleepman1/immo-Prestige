import CostumLoader from "@/components/Loader";
import useGetProperties from "@/hooks/property/useGetProperties";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconSearch, IconPin, IconEye, IconEdit, IconTrash, IconPlus, IconHome } from "@/components/utils/Icons";
import { ButtonDialog } from "@/components/utils/Dialog";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatPrice = (price, currency = "XOF") => {
  const locales = { XOF: "fr-FR", EUR: "fr-FR", USD: "en-US" };
  return new Intl.NumberFormat(locales[currency] || "fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
};

// Construit l'URL de l'image à partir du path relatif Laravel
const imgUrl = (path) =>
  path ? `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/${path}` : null;

// Badge statut
const STATUS = {
  sold:     { label: "Vendu",      cls: "badge-error px-4 rounded-xl" },
  active:   { label: "Disponible", cls: "badge-success px-4 rounded-xl" },
  inactive: { label: "Inactif",    cls: "badge-error px-4 rounded-xl" },
};
const getStatus = (property) => {
  if (property.sold)          return STATUS.sold;
  if (property.is_active)     return STATUS.active;
  return STATUS.inactive;
};

const PropertyImage = ({ src, alt }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-base-200">
        <IconHome />
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setError(true)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />;
};

// ─────────────────────────────────────────────────────────────────────────────
// PropertiesTable
//
// Props:
//   response  — objet complet retourné par Laravel (data + links + meta)
//   onPageChange(page) — appelé quand l'utilisateur change de page
//   onView(property)   — callback bouton Voir
//   onEdit(property)   — callback bouton Modifier
//   onDelete(property) — callback bouton Supprimer
//   onAdd()            — callback bouton Ajouter
// ─────────────────────────────────────────────────────────────────────────────
const PropertiesTable = ({
  response,          // { data, links, meta }
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const [search, setSearch] = useState("");
  const     [page, setPage] = useState(1);

  const navigate = useNavigate();

  const {properties, loading, error} = useGetProperties(page)


  // Extraire data / meta / links depuis la réponse Laravel
  const meta        = properties?.meta   ?? {};
  const links       = properties?.links  ?? {};
  const data        = properties?.data ?? []
  const currentPage = meta.current_page ?? 1;
  const lastPage    = meta.last_page    ?? 1;
  const total       = meta.total        ?? data.length;
  const perPage     = meta.per_page     ?? 10;
  const from        = meta.from         ?? 1;
  const to          = meta.to           ?? data.length;

 

  // Filtrage local (sur la page courante uniquement — le vrai filtre reste côté serveur)
  const filtered = data?.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.property_type?.name?.toLowerCase().includes(q) ||
      p.agency?.company_name?.toLowerCase().includes(q)
    );
  });

  // Numéros de pages pour la pagination (depuis meta.links Laravel)
  const pageLinks = (meta.links ?? []).filter(
    (l) => l.page !== null && l.label !== "&laquo; Previous" && l.label !== "Next &raquo;"
  );

  const goTo = (page) => {
    if (page < 1 || page > lastPage) return;
    setPage(page);

  };


  const handlePublish = (id) => {
    alert(id)
  }

  const handleView = (id) => {
    navigate(`/properties/${id}`)
  }

  const handleEdit = (id) => {
    navigate(`/properties/${id}/edit`)
  }

  const handleDelete = (id) => {
    alert(id)
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-6 md:p-10">
      {loading ? <CostumLoader /> : ( 
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{filtered[0]?.agency?.company_name}</h1>
            <p className="text-sm opacity-40 mt-0.5">
              {total} propriété{total > 1 ? "s" : ""} au total
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">


            <label className="input input-bordered input-sm flex items-center gap-2 rounded-xl w-60">
              <IconSearch />
              <input
                type="text"
                placeholder="Filtrer cette page…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="grow bg-transparent outline-none text-sm"
              />
            </label>


            <button
              className="btn btn-primary btn-sm rounded-xl gap-1.5"
              onClick={() => navigate("/properties/new")}
            >
              <IconPlus /> Ajouter un bien
            </button>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="rounded-2xl border border-base-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">

              <thead className="bg-base-200 text-xs uppercase tracking-widest opacity-60">
                <tr>
                  <th className="py-4 pl-5 w-20">Photo</th>
                  <th className="py-4">Propriété</th>
                  <th className="py-4">Prix</th>
                  <th className="py-4">Type</th>
                  <th className="py-4">Statut</th>
                  <th className="py-4 pr-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20 opacity-30 text-sm">
                      Aucune propriété trouvée.
                    </td>
                  </tr>
                ) : (
                  filtered.map((property) => {
                    
                    const firstImage = property.images?.[0];
                    const src        = firstImage ? imgUrl(firstImage.image_path) : null;
                    const status     = getStatus(property);
                    const currency   = property.devise_id?.code ?? "XOF";

                    return (
                      <tr key={property.id} className="hover group transition-colors">

                        {/* Photo */}
                        <td className="pl-5 py-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-base-300 group-hover:ring-primary/40 transition-all duration-300">
                            <PropertyImage src={src} alt={property.name} />
                          </div>
                        </td>

                        {/* Nom + localisation */}
                        <td className="py-3">
                          <p className="font-semibold text-sm">{property.name}</p>
                          <p className="text-xs opacity-40 mt-0.5 flex items-center gap-1">
                            <IconPin />
                            {[property.city, property.region]
                              .filter(Boolean).join(", ")}
                          </p>
                        
                          <p className="text-xs opacity-30 mt-0.5">
                            {property.surface} m²
                            {property.rooms ? ` · ${property.rooms} pièces` : ""}
                            {property.bedrooms ? ` · ${property.bedrooms} ch.` : ""}
                          </p>
                        </td>

                        {/* Prix */}
                        <td className="py-3 font-bold text-sm whitespace-nowrap">
                          {property.price.toLocaleString()}   {property.devise?.code}
                        </td>

                        {/* Type */}
                        <td className="py-3">
                          <span className="badge badge-success opacity-70 badge-sm rounded-xl px-4 font-medium">
                            {property.property_type?.name ?? "—"}
                          </span>
                        </td>

                       

                        {/* Statut */}
                        <td className="py-3">
                          <span className={`badge badge-sm font-semibold ${property.sold ? "badge-error px-4 rounded-xl" : property.is_active ? "badge-success px-4 rounded-xl" : "badge-error px-4 rounded-xl"}`}>
                            {property.sold ? "Vendu" : property.is_active ? "Disponible" : "Inactif"    }
                          </span>
                        </td>
                        

                        {/* Actions */}
                        <td className="py-3 pr-5">
                          <div className="flex items-center justify-end gap-2">


                            <ButtonDialog 
                                handleClick={() => handlePublish(property.id)} 
                                message="Voulez vous vraiment publier ce bien?" 
                                boutton="Publier"
                                description="Vous pouvez toujours retirer ce bien de la publication"
                                actionText="Publier"
                                role="default"
                            />


                            <button
                              className="btn btn-info btn-sm rounded-xl gap-1.5 border-0"
                              onClick={() => handleView(property.id)}
                            >
                              <IconEye /> 
                            </button>



                            <ButtonDialog 
                                handleClick={() => handleEdit(property.id)} 
                                message="Voulez vous vraiment modifier ce bien?" 
                                boutton={<IconEdit />}
                                description="Cette action est irréversible"
                                actionText="Modifier"
                                role="default"
                            />


                            <ButtonDialog 
                                handleClick={() => handleDelete(property.id)} 
                                message="Voulez vous vraiment supprimer ce bien?" 
                                boutton={<IconTrash />}
                                description="Cette action est irréversible"
                                actionText="Supprimer"
                                role="supprimer"
                            />

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {lastPage > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-base-300 bg-base-100/50">
              <span className="text-xs opacity-50">
                Affichage <span className="font-semibold opacity-100">{from}–{to}</span> sur{" "}
                <span className="font-semibold opacity-100">{total}</span> propriétés
              </span>

              <div className="join">
                {/* Précédent */}
                <button
                  className="join-item btn btn-xs"
                  onClick={() => goTo(currentPage - 1)}
                  disabled={!links.prev}
                >
                  «
                </button>

                {/* Pages (depuis meta.links Laravel) */}
                {pageLinks.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => goTo(link.page)}
                    className={`join-item btn btn-xs ${link.active ? "btn-primary" : ""}`}
                  >
                    {link.label}
                  </button>
                ))}

                {/* Suivant */}
                <button
                  className="join-item btn btn-xs"
                  onClick={() => goTo(currentPage + 1)}
                  disabled={!links.next}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>

      </div>)}
    </div>
  );
};

export default PropertiesTable;