import CostumLoader from "@/components/Loader";
import useGetProperty from "@/hooks/property/useGetProperty";
import { useParams } from "react-router-dom";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";

const PropertyDetailsClient = () => {
    const { id } = useParams();
    const { property, loading, error } = useGetProperty(id);
    const coverImage = property?.images?.[0] ? "http://localhost:8000/storage/" + property.images[0].image_path : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80";

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <CostumLoader />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center space-x-2">
                <p className="text-muted-foreground text-lg">Property not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 text-foreground py-0 md:py-8 px-0 md:px-4 flex justify-center items-start">
            <div className="w-full max-w-5xl bg-card md:border border-border md:rounded-xl shadow-2xl flex flex-col md:flex-row h-screen md:h-[85vh] overflow-hidden">
                
                {/* Media Section (Left side on desktop, top on mobile) */}
                <div className="w-full md:w-[55%] lg:w-[60%] bg-black flex items-center justify-center relative md:border-r border-border shrink-0 md:shrink">
                    <img 
                        src={coverImage} 
                        alt={property.title} 
                        className="w-full h-[40vh] md:h-full object-cover"
                    />
                </div>

                {/* Content Section (Right side on desktop, bottom on mobile) */}
                <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col bg-card h-full relative">
                    
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-card shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
                                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-xs font-bold">
                                    {property.agent?.name?.charAt(0) || property.agency?.name?.charAt(0) || 'A'}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm hover:text-muted-foreground cursor-pointer transition-colors">
                                    {property.agent?.name || property.agency?.name || "Premium Agent"}
                                </span>
                                <span className="text-xs text-muted-foreground leading-none">{property.address?.substring(0,25)}{property.address?.length > 25 ? '...' : ''}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="text-primary text-sm font-semibold hover:text-primary/80 transition">
                                Contact
                            </button>
                            <button className="text-foreground hover:text-muted-foreground transition">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Comments & Description */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        
                        {/* Post Caption / Property Description */}
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shrink-0">
                                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-[10px] font-bold">
                                    {property.agent?.name?.charAt(0) || property.agency?.name?.charAt(0) || 'A'}
                                </div>
                            </div>
                            <div className="text-sm pt-1 flex-1">
                                <div>
                                    <span className="font-semibold mr-2 cursor-pointer hover:underline">
                                        {property.agent?.name || property.agency?.name || "Premium Agent"}
                                    </span>
                                    <span className="text-lg font-bold block mt-1">{property.title}</span>
                                </div>
                                
                                <div className="mt-2 text-xl font-bold text-primary flex items-end gap-2">
                                    ${property.price?.toLocaleString()}
                                    <span className="text-xs text-muted-foreground font-normal pb-1">{property.type || 'For Sale'}</span>
                                </div>
                                
                                <div className="flex gap-4 mt-3 py-3 border-y border-border text-muted-foreground/80">
                                    <div className="flex items-baseline gap-1"><strong className="text-foreground text-sm">{property.bedrooms}</strong><span className="text-[10px] uppercase tracking-wider">Beds</span></div>
                                    <div className="flex items-baseline gap-1"><strong className="text-foreground text-sm">{property.bathrooms || 1}</strong><span className="text-[10px] uppercase tracking-wider">Baths</span></div>
                                    <div className="flex items-baseline gap-1"><strong className="text-foreground text-sm">{property.area || 120}</strong><span className="text-[10px] uppercase tracking-wider">m²</span></div>
                                </div>
                                
                                <p className="mt-3 leading-relaxed whitespace-pre-line text-foreground/90">
                                    {property.description}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">2 hours ago</p>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4 pt-2 border-t border-border/50">
                            {/* Comment 1 */}
                            <div className="flex gap-3 group">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-secondary flex items-center justify-center font-bold text-[10px]">JD</div>
                                <div className="text-sm flex-1">
                                    <p>
                                        <span className="font-semibold mr-2 cursor-pointer hover:underline">johndoe</span>
                                        Is this property still available for viewing this weekend? I am very interested.
                                    </p>
                                    <div className="flex gap-4 mt-1 text-[11px] text-muted-foreground font-medium">
                                        <span>2d</span>
                                        <button className="hover:text-foreground">Reply</button>
                                    </div>
                                    
                                    {/* Replies */}
                                    <div className="mt-2 flex items-center gap-3 cursor-pointer group/reply">
                                        <div className="h-[1px] w-6 bg-border group-hover/reply:bg-muted-foreground transition"></div>
                                        <span className="text-[11px] text-muted-foreground font-semibold group-hover/reply:text-foreground transition">View 1 reply</span>
                                    </div>
                                </div>
                                <button className="ml-2 text-muted-foreground hover:text-red-500 self-start pt-1 transition group-hover:opacity-100 opacity-0 md:opacity-100">
                                    <Heart className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Comment 2 */}
                            <div className="flex gap-3 group">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-secondary flex items-center justify-center font-bold text-[10px]">SM</div>
                                <div className="text-sm flex-1">
                                    <p>
                                        <span className="font-semibold mr-2 cursor-pointer hover:underline">sarah_m</span>
                                        Beautiful neighborhood! 😍
                                    </p>
                                    <div className="flex gap-4 mt-1 text-[11px] text-muted-foreground font-medium">
                                        <span>1d</span>
                                        <button className="hover:text-foreground">Reply</button>
                                    </div>
                                </div>
                                <button className="ml-2 text-red-500 self-start pt-1 transition group-hover:opacity-100 opacity-0 md:opacity-100">
                                    <Heart className="w-3 h-3 fill-current" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Add Comment (Sticky bottom) */}
                    <div className="border-t border-border bg-card shrink-0">
                        <div className="px-4 py-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                    <button className="hover:text-muted-foreground transition transform hover:scale-110"><Heart className="w-6 h-6 stroke-[1.5]" /></button>
                                    <button className="hover:text-muted-foreground transition transform hover:scale-110"><MessageCircle className="w-6 h-6 stroke-[1.5]" /></button>
                                    <button className="hover:text-muted-foreground transition transform hover:scale-110"><Share2 className="w-6 h-6 stroke-[1.5]" /></button>
                                </div>
                                <button className="hover:text-muted-foreground transition transform hover:scale-110"><Bookmark className="w-6 h-6 stroke-[1.5]" /></button>
                            </div>
                            <div>
                                <p className="font-semibold text-sm cursor-pointer mb-0">1,234 likes</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">March 4</p>
                            </div>
                        </div>
                        
                        {/* Input Comment */}
                        <div className="px-4 py-3 border-t border-border flex items-center gap-3">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-secondary flex items-center justify-center font-bold text-xs uppercase">
                                {/* Current User Avatar PlaceHolder */}
                                U
                            </div>
                            <input 
                                type="text" 
                                placeholder="Add a comment..." 
                                className="w-full bg-transparent border-none text-sm outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
                            />
                            <button className="text-primary text-sm font-semibold opacity-50 hover:opacity-100 transition whitespace-nowrap">
                                Post
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsClient;
