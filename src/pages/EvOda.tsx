import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users, Plus, Search, Filter, Heart, MessageCircle } from "lucide-react";
import { CreateHomeListingDialog } from "@/components/CreateHomeListingDialog";
import { toast } from "sonner";

interface HomeListing {
  id: string;
  title: string;
  location: string;
  price: number;
  type: "Ev" | "Oda";
  images: string[];
  description: string;
  contact: string;
  createdAt: string;
  isLiked: boolean;
  likes: number;
}

const mockListings: HomeListing[] = [
  {
    id: "1",
    title: "Bebek'te Deniz Manzaralı Oda",
    location: "Bebek",
    price: 8000,
    type: "Oda",
    images: ["/placeholder.svg"],
    description: "Deniz manzaralı, mobilyalı oda. Ortak alanlar mevcut.",
    contact: "ahmet.yilmaz@std.bogazici.edu.tr",
    createdAt: "2024-01-15",
    isLiked: false,
    likes: 12
  },
  {
    id: "2",
    title: "Etiler'de 2+1 Daire",
    location: "Etiler",
    price: 25000,
    type: "Ev",
    images: ["/placeholder.svg"],
    description: "Yeni yapı, eşyalı, güvenlikli site içinde.",
    contact: "zeynep.kaya@std.bogazici.edu.tr",
    createdAt: "2024-01-14",
    isLiked: true,
    likes: 8
  }
];

export default function EvOda() {
  const [listings, setListings] = useState<HomeListing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"Tümü" | "Ev" | "Oda">("Tümü");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleLike = (id: string) => {
    setListings(listings.map(listing => 
      listing.id === id 
        ? { ...listing, isLiked: !listing.isLiked, likes: listing.isLiked ? listing.likes - 1 : listing.likes + 1 }
        : listing
    ));
  };

  const handleContact = (contact: string) => {
    toast.success(`İletişim: ${contact}`);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "Tümü" || listing.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateListing = (listingData: any) => {
    const newListing: HomeListing = {
      id: Date.now().toString(),
      title: listingData.title,
      location: listingData.location,
      price: listingData.price,
      type: listingData.type,
      images: listingData.images || ["/placeholder.svg"],
      description: listingData.description,
      contact: listingData.contact,
      createdAt: new Date().toISOString().split('T')[0],
      isLiked: false,
      likes: 0
    };
    
    setListings([newListing, ...listings]);
    setIsCreateDialogOpen(false);
    toast.success("İlan başarıyla eklendi!");
  };

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam İlan</p>
                  <p className="text-2xl font-bold text-primary">{listings.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ev İlanları</p>
                  <p className="text-2xl font-bold text-accent">{listings.filter(l => l.type === "Ev").length}</p>
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
                  <p className="text-2xl font-bold text-secondary-foreground">{listings.filter(l => l.type === "Oda").length}</p>
                </div>
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-success/10 to-success/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ortalama Fiyat</p>
                  <p className="text-2xl font-bold text-success">
                    {Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length)}₺
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative">
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge 
                  className={`absolute top-3 right-3 ${
                    listing.type === "Ev" ? "bg-primary" : "bg-accent"
                  } text-white`}
                >
                  {listing.type}
                </Badge>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-bold text-primary">{listing.price.toLocaleString()}₺</span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                </div>
                
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{listing.location}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {listing.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(listing.id)}
                      className={`h-8 ${listing.isLiked ? 'text-success hover:text-success' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${listing.isLiked ? 'fill-current' : ''}`} />
                      {listing.likes}
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContact(listing.contact)}
                    className="text-sm border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    İletişim
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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