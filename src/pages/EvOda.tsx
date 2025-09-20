import { useState, useEffect } from "react";
import { fetchFirstPage, fetchNextPage } from "@/lib/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, TrendingUp, Users, Plus, Search, Filter, Heart, MessageCircle, House, Building, Bookmark } from "lucide-react";
import { CreateHomeListingDialog } from "@/components/CreateHomeListingDialog";
import { ContactPopover } from "@/components/ContactPopover";
import { ImageGallery } from "@/components/ImageGallery";
import { ProfilePopover } from "@/components/ProfilePopover";
import { useHousing } from "@/hooks/useHousing";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useDisplayName } from "@/hooks/useDisplayName";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EvOda() {
  const { createItem, markAsRented } = useHousing();
  const { favorites, toggleFavorite, isFavorited } = useFavorites();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"Tümü" | "Ev" | "Oda">("Tümü");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setListLoading(true);
      const res = await fetchFirstPage(
        "housing",
        "id,user_id,title,description,location,room_type,rent_price,contact_info,image_urls,available_from,is_rented,created_at",
        20,
        "created_at"
      );
      if (!mounted) return;
      setRows(res.data);
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
      setListLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const loadMore = async () => {
    if (!hasMore || listLoading) return;
    setListLoading(true);
    const res = await fetchNextPage(
      "housing",
      cursor,
      "id,user_id,title,description,location,room_type,rent_price,contact_info,image_urls,available_from,is_rented,created_at",
      20,
      "created_at"
    );
    setRows(prev => [...prev, ...res.data]);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
    setListLoading(false);
  };

  const handleContact = (contact: string) => {
    if (contact.includes("@")) {
      window.open(`mailto:${contact}`, '_blank');
    } else {
      toast.success(`İletişim: ${contact}`);
    }
  };

  const handleFavorite = (itemId: string) => {
    toggleFavorite(itemId, 'housing');
  };

  const filteredListings = rows.filter(item => {
    if (item.is_rented) return false; // Hide rented items
    
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "Tümü" || item.room_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateListing = async (listingData: any) => {
    const result = await createItem({
      title: listingData.title,
      location: listingData.location,
      rent_price: listingData.price,
      room_type: listingData.type,
      description: listingData.description,
      contact_info: listingData.contact,
      image_urls: listingData.image_urls,
      available_from: listingData.availableFrom || null,
    });

    if (result) {
      setIsCreateDialogOpen(false);
    }
  };

  const totalListings = rows.filter(item => !item.is_rented).length;
  const rentedListings = rows.filter(item => item.is_rented).length;
  const houseListings = rows.filter(item => item.room_type === "Ev" && !item.is_rented).length;
  const roomListings = rows.filter(item => item.room_type === "Oda" && !item.is_rented).length;
  const averagePrice = rows.length > 0 
    ? Math.round(rows.reduce((sum, item) => sum + (item.rent_price || 0), 0) / rows.length)
    : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Building className="w-8 h-8 mr-3" />
            Ev & Oda İlanları
          </h1>
          <p className="text-primary-foreground/90">
            Öğrenci evleri ve oda paylaşımları
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div></div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              İlan Ekle
            </Button>
          </div>
        </div>

        {listLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border">
                <CardContent className="p-3">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Aktif İlan</p>
                    <p className="text-lg font-bold text-primary">{totalListings}</p>
                  </div>
                  <House className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Kiralanan</p>
                    <p className="text-lg font-bold text-muted-foreground">{rentedListings}</p>
                  </div>
                  <House className="w-6 h-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Ev İlanları</p>
                    <p className="text-lg font-bold text-accent">{houseListings}</p>
                  </div>
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Oda İlanları</p>
                    <p className="text-lg font-bold text-secondary-foreground">{roomListings}</p>
                  </div>
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8 border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="İlan başlığı veya konum ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {["Tümü", "Ev", "Oda"].map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    onClick={() => setSelectedType(type as any)}
                    className="min-w-[80px]"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => {
              const isRented = item.is_rented;
              const HousingItemCard = ({ item }: { item: any }) => {
                const { displayName } = useDisplayName(item.user_id);
                
                return (
                  <Card key={item.id} className={cn(
                    "border transition-all duration-300 overflow-hidden group",
                    isRented && "opacity-50"
                  )}>
                    <div className="relative">
                      {item.image_urls && item.image_urls.length > 0 ? (
                        <ImageGallery 
                          images={item.image_urls} 
                          title={item.title}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <House className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {isRented && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge className="bg-destructive text-destructive-foreground">
                            KİRALANDI
                          </Badge>
                        </div>
                      )}
                      
                      <Badge 
                        className={`absolute top-3 right-3 ${
                          item.room_type === "Ev" ? "bg-primary" : "bg-accent"
                        } text-white`}
                      >
                        {item.room_type}
                      </Badge>
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-sm font-bold text-primary">{item.rent_price?.toLocaleString() || 0}₺</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <ProfilePopover userId={item.user_id} />
                        <span className="text-sm text-muted-foreground">{displayName}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{item.location}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFavorite(item.id)}
                        className={`h-8 ${favorites.some(fav => fav.item_id === item.id && fav.item_type === 'housing') ? 'text-success hover:text-success' : 'text-muted-foreground'}`}
                      >
                        <Bookmark className={`w-4 h-4 mr-1 ${favorites.some(fav => fav.item_id === item.id && fav.item_type === 'housing') ? 'fill-current' : ''}`} />
                        Kaydet
                      </Button>
                      
                      <div className="flex gap-2">
                        {user && user.id === item.user_id && !isRented && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => markAsRented(item.id)}
                            className="text-xs"
                          >
                            Kiralanan İlan
                          </Button>
                        )}
                        
                        <ContactPopover contactInfo={item.contact_info || ''} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            };
            
            return <HousingItemCard key={item.id} item={item} />;
            })}
          </div>
        )}

        {filteredListings.length === 0 && (
          <Card className="border">
            <CardContent className="p-12 text-center">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">İlan bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerinize uygun ilan bulunamadı. Farklı anahtar kelimeler deneyin.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateHomeListingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateListing}
      />
    </div>
  );
}