// import { useNavigate } from "react-router-dom";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import {
//   MapPin,
//   BedDouble,
//   LayoutGrid,
//   Maximize2,
//   Plus,
//   Building2,
//   Eye,
//   Pencil,
//   Trash2,
//   Home,
// } from "lucide-react";

// // ── Mock data ────────────────────────────────────────────────────────────────
// const PROPERTIES = [
//   {
//     id: 1,
//     property_type_id: 4,
//     agency_id: 1,
//     devise_id: 1,
//     name: "Appartement de Luxe",
//     description: null,
//     surface: 400,
//     rooms: 5,
//     bedrooms: 18,
//     floor: 3,
//     furnished: true,
//     price: 18000000,
//     country: "Senegal",
//     region: "Dakar",
//     city: "Keur Massar",
//     address: "Rue Santhiaba",
//     sold: false,
//     is_active: true,
//   },
//   {
//     id: 2,
//     property_type_id: 1,
//     agency_id: 1,
//     devise_id: 1,
//     name: "Villa Prestige Almadies",
//     description: "Belle villa avec piscine et jardin",
//     surface: 650,
//     rooms: 8,
//     bedrooms: 5,
//     floor: null,
//     furnished: true,
//     price: 45000000,
//     country: "Senegal",
//     region: "Dakar",
//     city: "Les Almadies",
//     address: "Route de Ngor",
//     sold: false,
//     is_active: true,
//   },
//   {
//     id: 3,
//     property_type_id: 2,
//     agency_id: 1,
//     devise_id: 1,
//     name: "Studio Moderne Plateau",
//     description: "Studio entièrement rénové au cœur du Plateau",
//     surface: 45,
//     rooms: 2,
//     bedrooms: 1,
//     floor: 5,
//     furnished: false,
//     price: 3500000,
//     country: "Senegal",
//     region: "Dakar",
//     city: "Plateau",
//     address: "Avenue Pompidou",
//     sold: false,
//     is_active: true,
//   },
//   {
//     id: 4,
//     property_type_id: 3,
//     agency_id: 1,
//     devise_id: 1,
//     name: "Duplex Mermoz",
//     description: "Duplex spacieux dans un quartier calme",
//     surface: 230,
//     rooms: 6,
//     bedrooms: 3,
//     floor: 2,
//     furnished: false,
//     price: 12500000,
//     country: "Senegal",
//     region: "Dakar",
//     city: "Mermoz",
//     address: "Rue 10 Extension",
//     sold: true,
//     is_active: false,
//   },
//   {
//     id: 5,
//     property_type_id: 1,
//     agency_id: 1,
//     devise_id: 1,
//     name: "Maison Familiale Sacré-Cœur",
//     description: null,
//     surface: 320,
//     rooms: 7,
//     bedrooms: 4,
//     floor: null,
//     furnished: true,
//     price: 28000000,
//     country: "Senegal",
//     region: "Dakar",
//     city: "Sacré-Cœur",
//     address: "Cité Mixta",
//     sold: false,
//     is_active: true,
//   },
//   {
//     id: 6,
//     property_type_id: 4,
//     agency_id: 1,
//     devise_id: 1,
//     name: "Appartement Vue Mer Corniche",
//     description: "Vue imprenable sur l'Atlantique",
//     surface: 180,
//     rooms: 4,
//     bedrooms: 2,
//     floor: 8,
//     furnished: true,
//     price: 22000000,
//     country: "Senegal",
//     region: "Dakar",
//     city: "Corniche Ouest",
//     address: "Boulevard de la Corniche",
//     sold: false,
//     is_active: true,
//   },
// ];

// const TYPE_LABELS = {
//   1: "Villa",
//   2: "Studio",
//   3: "Duplex",
//   4: "Appartement",
// };

// const TYPE_COLORS = {
//   1: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
//   2: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
//   3: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
//   4: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
// };

// const formatPrice = (price) =>
//   new Intl.NumberFormat("fr-SN", {
//     style: "currency",
//     currency: "XOF",
//     maximumFractionDigits: 0,
//   }).format(price);

// // ── Property Card ────────────────────────────────────────────────────────────
// const PropertyCard = ({ property }) => {
//   const typeLabel = TYPE_LABELS[property.property_type_id] ?? "Bien";
//   const typeColor =
//     TYPE_COLORS[property.property_type_id] ??
//     "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

//   return (
//     <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
//       {/* Top colour strip */}
//       <div
//         className="h-1.5 w-full"
//         style={{
//           background:
//             "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.4) 100%)",
//         }}
//       />

//       <CardHeader className="px-5 pt-5 pb-3 space-y-3">
//         {/* Badges row */}
//         <div className="flex items-center gap-2 flex-wrap">
//           <span
//             className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${typeColor}`}
//           >
//             <Building2 size={11} />
//             {typeLabel}
//           </span>

//           {property.furnished && (
//             <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
//               <Home size={11} />
//               Meublé
//             </span>
//           )}

//           {property.sold ? (
//             <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
//               Vendu
//             </span>
//           ) : property.is_active ? (
//             <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
//               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//               Actif
//             </span>
//           ) : (
//             <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
//               Inactif
//             </span>
//           )}
//         </div>

//         {/* Title */}
//         <h3 className="text-foreground font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
//           {property.name}
//         </h3>

//         {/* Location */}
//         <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
//           <MapPin size={13} className="shrink-0 text-primary" />
//           <span className="truncate">
//             {property.address}, {property.city} — {property.region}
//           </span>
//         </div>
//       </CardHeader>

//       <Separator className="mx-5" />

//       <CardContent className="px-5 py-4 flex-1 space-y-4">
//         {/* Stats grid */}
//         <div className="grid grid-cols-3 gap-3">
//           <StatPill
//             icon={<Maximize2 size={14} />}
//             label="Surface"
//             value={`${property.surface} m²`}
//           />
//           <StatPill
//             icon={<LayoutGrid size={14} />}
//             label="Pièces"
//             value={property.rooms}
//           />
//           <StatPill
//             icon={<BedDouble size={14} />}
//             label="Chambres"
//             value={property.bedrooms}
//           />
//         </div>

//         {/* Description */}
//         {property.description && (
//           <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
//             {property.description}
//           </p>
//         )}

//         {/* Floor */}
//         {property.floor !== null && (
//           <p className="text-xs text-muted-foreground">
//             Étage :{" "}
//             <span className="font-medium text-foreground">{property.floor}</span>
//           </p>
//         )}
//       </CardContent>

//       <Separator className="mx-5" />

//       <CardFooter className="px-5 py-4 flex items-center justify-between gap-3">
//         {/* Price */}
//         <div>
//           <p className="text-xs text-muted-foreground mb-0.5">Prix</p>
//           <p className="text-base font-extrabold text-primary tabular-nums">
//             {formatPrice(property.price)}
//           </p>
//         </div>

//         {/* Actions */}
//         <div className="flex items-center gap-2">
//           <Button
//             size="icon"
//             variant="ghost"
//             className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
//             title="Voir"
//           >
//             <Eye size={15} />
//           </Button>
//           <Button
//             size="icon"
//             variant="ghost"
//             className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
//             title="Modifier"
//           >
//             <Pencil size={15} />
//           </Button>
//           <Button
//             size="icon"
//             variant="ghost"
//             className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
//             title="Supprimer"
//           >
//             <Trash2 size={15} />
//           </Button>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// // Small stat pill helper
// const StatPill = ({ icon, label, value }) => (
//   <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 px-2 py-2.5 text-center">
//     <span className="text-primary">{icon}</span>
//     <span className="text-xs text-muted-foreground leading-none">{label}</span>
//     <span className="text-sm font-bold text-foreground leading-none">{value}</span>
//   </div>
// );

// // ── Page ─────────────────────────────────────────────────────────────────────
// const Properties = () => {
//   // Replace with: const navigate = useNavigate();
//   const navigate = { push: (path) => console.log("Navigate to", path) }; // stub

//   return (
//     <div className="min-h-screen flex flex-col px-6 py-10 bg-background transition-colors duration-300">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
//             Gestion des biens
//           </h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             {PROPERTIES.length} biens enregistrés
//           </p>
//         </div>

//         <Button
//           onClick={() => navigate.push("/properties/new")}
//           className="gap-2 rounded-xl px-5 font-semibold shadow-md shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200"
//         >
//           <Plus size={16} />
//           Ajouter un bien
//         </Button>
//       </div>

//       {/* Grid */}
//       {PROPERTIES.length === 0 ? (
//         <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 py-24">
//           <Building2 size={48} className="opacity-30" />
//           <p className="text-lg font-medium">Aucun bien trouvé</p>
//           <p className="text-sm">Commencez par en ajouter un !</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//           {PROPERTIES.map((property) => (
//             <PropertyCard key={property.id} property={property} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Properties;