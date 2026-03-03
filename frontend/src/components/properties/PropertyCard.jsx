import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    MapPin,
    BedDouble,
    LayoutGrid,
    Maximize2,
    Building2,
    Eye,
    Pencil,
    Trash2,
    Home,
    Heart,
} from "lucide-react";



export const PropertyCard = ({ property }) => {
    
    const coverImage = property.images?.[0] ? "http://localhost:8000/storage/" + property.images[0].image_path : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";
 

    return (
        <Card className="group flex flex-col overflow-hidden rounded-[1.25rem] border-0 shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 bg-background dark:shadow-none dark:border dark:border-border">
            {/* Image Section */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                    src={coverImage}
                    alt={property.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/30 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <div className="flex flex-col gap-1.5 items-start">
                        <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm border-0 font-medium tracking-wide shadow-sm rounded-lg px-2.5 py-1">
                            <Building2 className="mr-1.5 h-3.5 w-3.5 text-primary" />
                            {property.property_type?.name}
                        </Badge>
                        {property.furnished && (
                            <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary backdrop-blur-sm border-0 font-medium tracking-wide shadow-sm rounded-lg px-2.5 py-1">
                                <Home className="mr-1.5 h-3.5 w-3.5" />
                                Meublé
                            </Badge>
                        )}
                    </div>

                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40 hover:text-white border border-white/30 transition-all">
                        <Heart className="h-4 w-4" />
                    </Button>
                </div>

                {/* Bottom Status Badge */}
                <div className="absolute bottom-4 left-4">
                    {property.sold ? (
                        <Badge className="bg-destructive/90 text-destructive-foreground hover:bg-destructive backdrop-blur-sm border-0 font-medium shadow-sm rounded-lg">
                            Vendu
                        </Badge>
                    ) : property.is_active ? (
                        <Badge className="bg-emerald-500/90 text-white hover:bg-emerald-500 backdrop-blur-sm border-0 font-medium shadow-sm rounded-lg px-2.5 py-1">
                            <span className="mr-1.5 flex h-2 w-2 rounded-full bg-white animate-pulse" />
                            Garantie
                        </Badge>
                    ) : (
                        <Badge className="bg-slate-900/80 text-white hover:bg-slate-900 backdrop-blur-sm border-0 font-medium shadow-sm rounded-lg">
                            Inactif
                        </Badge>
                    )}
                </div>
            </div>

            <CardContent className="flex-1 p-5 space-y-4">
                {/* Title and Location */}
                <div className="space-y-2">
                    <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {property.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                        <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                        <span className="truncate">
                            {property.address}, {property.city}
                        </span>
                    </div>
                </div>

                {/* Details List */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5" title="Surface">
                        <Maximize2 className="h-4 w-4 text-foreground/70" />
                        <span className="font-medium">{property.surface} m²</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5" title="Pièces">
                        <LayoutGrid className="h-4 w-4 text-foreground/70" />
                        <span className="font-medium">{property.rooms} Pièces</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5" title="Chambres">
                        <BedDouble className="h-4 w-4 text-foreground/70" />
                        <span className="font-medium">{property.bedrooms} Ch.</span>
                    </div>
                </div>

                <div className="w-full h-px bg-border/60" />

                {/* Price & Actions */}
                <div className="flex items-end justify-between pt-1">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Prix demandé
                        </span>
                        <span className="text-2xl font-black text-primary tracking-tight">
                            {new Intl.NumberFormat("fr-SN", {
                                style: "currency",
                                currency: "XOF",
                                maximumFractionDigits: 0,
                            }).format(property.price)}
                        </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-muted/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
