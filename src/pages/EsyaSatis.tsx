import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search, Filter, MapPin, DollarSign, Eye, Heart, Package, TrendingUp, Star, Phone } from "lucide-react";
import { useMarketplace, type MarketplaceItem } from "@/hooks/useMarketplace";
import { CreateMarketplaceDialog } from "@/components/CreateMarketplaceDialog";
import { useAuth } from "@/hooks/useAuth";

// Filter options
const conditions = ["Tümü", "Yeni", "Sıfır Ayarında", "İyi", "Orta", "Kötü"];
const categories = ["Tümü", "Elektronik", "Giyim", "Kitap", "Mobilya", "Spor", "Diğer"];

const categoryMap: { [key: string]: string } = {
  "electronics": "Elektronik",
  "clothing": "Giyim", 
  "books": "Kitap",
  "furniture": "Mobilya",
  "sports": "Spor",
  "other": "Diğer"
};

const conditionMap: { [key: string]: string } = {
  "new": "Yeni",
  "like-new": "Sıfır Ayarında",
  "good": "İyi", 
  "fair": "Orta",
  "poor": "Kötü"
};

const EsyaSatis = () => {
  const { items: marketplaceItems, loading } = useMarketplace();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedCondition, setSelectedCondition] = useState("Tümü");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return marketplaceItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Tümü" || 
                            categoryMap[item.category] === selectedCategory;
      const matchesCondition = selectedCondition === "Tümü" || 
                             conditionMap[item.condition] === selectedCondition;
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
    });
  }, [marketplaceItems, searchQuery, selectedCategory, selectedCondition, priceRange]);

  // Calculate statistics
  const totalListings = marketplaceItems.filter(item => !item.is_sold).length;
  const uniqueCategories = new Set(marketplaceItems.map(item => item.category)).size;
  const thisMonthListings = marketplaceItems.filter(item => {
    const itemDate = new Date(item.created_at);
    const currentDate = new Date();
    return itemDate.getMonth() === currentDate.getMonth() && 
           itemDate.getFullYear() === currentDate.getFullYear();
  }).length;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Tümü");
    setSelectedCondition("Tümü");
    setPriceRange([0, 50000]);
  };

  const handleContactClick = (contactInfo: string) => {
    if (contactInfo.includes('@')) {
      window.location.href = `mailto:${contactInfo}`;
    } else {
      window.location.href = `tel:${contactInfo}`;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Eşya Alım Satım</h2>
            <p className="text-muted-foreground mt-1">
              Kampüs içinde güvenli alım satım
            </p>
          </div>
          <CreateMarketplaceDialog />
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktif İlan</p>
                  <p className="text-2xl font-bold">{totalListings}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kategori</p>
                  <p className="text-2xl font-bold">{uniqueCategories}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bu Ay</p>
                  <p className="text-2xl font-bold">{thisMonthListings}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Eşya ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtreler
            </Button>
            <Badge variant="secondary">
              {filteredItems.length} sonuç
            </Badge>
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Durum</label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  Fiyat Aralığı: ₺{priceRange[0].toLocaleString()} - ₺{priceRange[1].toLocaleString()}
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={50000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && !loading && (
          <Card className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">
              Arama kriterlerinizle eşleşen ilan bulunamadı.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Filtreleri Temizle
            </Button>
          </Card>
        )}

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MarketplaceItemCard 
                key={item.id} 
                item={item} 
                onContactClick={handleContactClick}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Marketplace Item Card Component
const MarketplaceItemCard = ({ 
  item, 
  onContactClick,
  currentUser 
}: { 
  item: MarketplaceItem; 
  onContactClick: (contactInfo: string) => void;
  currentUser: any;
}) => {
  const { markAsSold } = useMarketplace();
  const isOwner = currentUser?.id === item.user_id;

  const handleMarkAsSold = () => {
    markAsSold(item.id);
  };

  const handleContact = () => {
    // Simulate contact info (in real app, this would come from profiles)
    const contactInfo = "05551234567"; // This would be fetched from user profile
    onContactClick(contactInfo);
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all ${item.is_sold ? 'opacity-60' : ''}`}>
      <div className="aspect-video bg-gray-100 relative">
        {item.image_urls && item.image_urls.length > 0 ? (
          <img 
            src={item.image_urls[0]} 
            alt={item.title}
            className={`w-full h-full object-cover ${item.is_sold ? 'filter grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {item.is_sold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              VERİLDİ
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-2xl font-bold text-primary">₺{item.price.toLocaleString()}</p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{conditionMap[item.condition] || item.condition}</Badge>
            <Badge variant="outline">{categoryMap[item.category] || item.category}</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
          
          <div className="flex gap-2 pt-2">
            {isOwner && !item.is_sold ? (
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex-1"
                onClick={handleMarkAsSold}
              >
                VERİLDİ Olarak İşaretle
              </Button>
            ) : !item.is_sold ? (
              <Button 
                size="sm" 
                className="flex-1 gap-2"
                onClick={handleContact}
              >
                <Phone className="h-4 w-4" />
                İletişim
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="flex-1" 
                disabled
              >
                Verilmiş
              </Button>
            )}
            {!isOwner && (
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EsyaSatis;