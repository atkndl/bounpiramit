import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, TrendingUp, Users, Plus, Search, Filter, Heart, MessageCircle, House } from "lucide-react";
import { CreateHomeListingDialog } from "@/components/CreateHomeListingDialog";
import { useHousing } from "@/hooks/useHousing";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EvOda() {
  const { items: housingItems, loading, createItem, markAsRented } = useHousing();
  const { favorites, toggleFavorite, isFavorited } = useFavorites();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"Tümü" | "Ev" | "Oda">("Tümü");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const filteredListings = housingItems.filter(item => {
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
      images: listingData.images,
      available_from: listingData.availableFrom || null,
    });

    if (result) {
      setIsCreateDialogOpen(false);
    }
  };

  // Calculate statistics
  const totalListings = housingItems.filter(item => !item.is_rented).length;
  const rentedListings = housingItems.filter(item => item.is_rented).length;
  const houseListings = housingItems.filter(item => item.room_type === "Ev" && !item.is_rented).length;
  const roomListings = housingItems.filter(item => item.room_type === "Oda" && !item.is_rented).length;
  const averagePrice = housingItems.length > 0 
    ? Math.round(housingItems.reduce((sum, item) => sum + (item.rent_price || 0), 0) / housingItems.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ev & Oda İlanları
            </h1>
            <p className="text-muted-foreground mt-2">
              Kampüs yakınında ev ve oda kirala
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            İlan Aç
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aktif İlan</p>
                    <p className="text-2xl font-bold text-primary">{totalListings}</p>
                  </div>
                  <House className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-muted/20 to-muted/10 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Kiralanan</p>
                    <p className="text-2xl font-bold text-muted-foreground">{rentedListings}</p>
                  </div>
                  <House className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ev İlanları</p>
                    <p className="text-2xl font-bold text-accent">{houseListings}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-secondary/10 to-secondary/5 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Oda İlanları</p>
                    <p className="text-2xl font-bold text-secondary-foreground">{roomListings}</p>
                  </div>
                  <Users className="w-8 h-8 text-secondary-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-md">
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
        {loading ? (
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
              const imageUrl = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : "/placeholder.svg";
              
              return (
                <Card key={item.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
                        className={`h-8 ${isFavorited(item.id, 'housing') ? 'text-success hover:text-success' : 'text-muted-foreground'}`}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${isFavorited(item.id, 'housing') ? 'fill-current' : ''}`} />
                        {isFavorited(item.id, 'housing') ? 'Favoride' : 'Favorile'}
                      </Button>
                      
                      <div className="flex gap-2">
                        {user && user.id === item.user_id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => markAsRented(item.id)}
                            className="text-xs"
                          >
                            Pasif Yap
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContact(item.contact_info || '')}
                          className="text-sm border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          İletişim
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredListings.length === 0 && (
          <Card className="border-0 shadow-md">
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