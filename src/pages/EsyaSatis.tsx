import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search, Filter, MapPin, ShoppingBag, Eye, Heart, Package, TrendingUp, Star, Phone } from "lucide-react";
import { useMarketplace, type MarketplaceItem } from "@/hooks/useMarketplace";
import { CreateMarketplaceDialog } from "@/components/CreateMarketplaceDialog";
import { ContactPopover } from "@/components/ContactPopover";
import { ImageGallery } from "@/components/ImageGallery";
import { fetchFirstPage, fetchNextPage } from "@/lib/pagination";

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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedCondition, setSelectedCondition] = useState("Tümü");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);
  const [hideSoldItems, setHideSoldItems] = useState(false);

  const [rows, setRows] = useState<MarketplaceItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setListLoading(true);
      const res = await fetchFirstPage(
        "marketplace",
        "id,title,description,category,condition,price,contact_info,image_urls,user_id,is_sold,created_at",
        20,
        "created_at"
      );
      if (!mounted) return;
      setRows(res.data as MarketplaceItem[]);
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
      "marketplace",
      cursor,
      "id,title,description,category,condition,price,contact_info,image_urls,user_id,is_sold,created_at",
      20,
      "created_at"
    );
    setRows(prev => [...prev, ...(res.data as MarketplaceItem[])]);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
    setListLoading(false);
  };

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return rows.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Tümü" || 
                            categoryMap[item.category] === selectedCategory;
      const matchesCondition = selectedCondition === "Tümü" || 
                             conditionMap[item.condition] === selectedCondition;
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      const matchesSoldFilter = hideSoldItems ? !item.is_sold : true;
      
      return matchesSearch && matchesCategory && matchesCondition && matchesPrice && matchesSoldFilter;
    });
  }, [rows, searchQuery, selectedCategory, selectedCondition, priceRange, hideSoldItems]);

  // Calculate statistics
  const totalListings = rows.filter(item => !item.is_sold).length;
  const soldListings = rows.filter(item => item.is_sold).length;
  const uniqueCategories = new Set(rows.map(item => item.category)).size;
  const thisMonthListings = rows.filter(item => {
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
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <ShoppingBag className="w-8 h-8 mr-3" />
            Eşya Alım Satım
          </h1>
          <p className="text-primary-foreground/90">
            Kampüs içinde güvenli alım satım
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Stats and Add Button */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <Package className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-primary" />
                  <div className="text-lg md:text-2xl font-bold text-primary">
                    {totalListings}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Aktif İlan</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <Package className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-lg md:text-2xl font-bold text-muted-foreground">
                    {soldListings}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Pasif İlan</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <Star className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-lg md:text-2xl font-bold text-yellow-500">
                    {uniqueCategories}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Kategori</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-green-500" />
                  <div className="text-lg md:text-2xl font-bold text-green-500">
                    {thisMonthListings}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Bu Ay</div>
                </CardContent>
              </Card>
            </div>
            
            <CreateMarketplaceDialog onItemCreated={() => window.location.reload()} />
          </div>

          {/* Search Bar */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Eşya ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtreler</span>
              </Button>
              
              {showFilters && (
                <div className="flex flex-wrap gap-4 flex-1">
                  <div className="min-w-[160px]">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori" />
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
                  
                  <div className="min-w-[140px]">
                    <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum" />
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
                  
                  <div className="space-y-4 min-w-[200px]">
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
              
              <Button
                variant={hideSoldItems ? "default" : "outline"}
                onClick={() => setHideSoldItems(!hideSoldItems)}
                className="flex items-center space-x-2 min-w-fit"
              >
                <Eye className="w-4 h-4" />
                <span>Verilmişleri Gizle</span>
              </Button>
              
              <Badge variant="secondary" className="ml-auto">
                {filteredItems.length} sonuç
              </Badge>
            </div>
          </div>
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
        {listLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : (
          <>
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
            <div className="flex justify-center mt-6">
              <Button onClick={loadMore} disabled={!hasMore || listLoading}>Daha Fazla</Button>
            </div>
          </>
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


  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all border-2 border-border/40 hover:border-border/60 ${item.is_sold ? 'opacity-60' : ''}`}>
      <div className="relative">
        {item.image_urls && item.image_urls.length > 0 ? (
          <div className={item.is_sold ? 'filter grayscale' : ''}>
            <ImageGallery images={item.image_urls} title={item.title} />
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
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
            ) : !item.is_sold && item.contact_info ? (
              <ContactPopover 
                contactInfo={item.contact_info} 
                buttonSize="sm"
              >
                <Button size="sm" className="flex-1 gap-2">
                  <Phone className="h-4 w-4" />
                  İletişim
                </Button>
              </ContactPopover>
            ) : !item.is_sold ? (
              <Button 
                size="sm" 
                className="flex-1" 
                disabled
              >
                İletişim Bilgisi Yok
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