import { useState, useEffect } from "react";
import { fetchFirstPage, fetchNextPage } from "@/lib/pagination";
import { LostItemCard } from "@/components/LostItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, Eye, Filter } from "lucide-react";
import { useLostItems } from "@/hooks/useLostItems";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

const locations = [
  "Tümü",
  "Güney Kampüs Kütüphanesi", 
  "ETA Binası",
  "Hisar Boyu",
  "Spor Salonu",
  "Kuzey Kampüs", 
  "Merkezi Derslikler",
  "Yemekhane"
];

const KayipEsya = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Tümü");
  const [selectedType, setSelectedType] = useState<"all" | "lost" | "found">("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const { createLostItem, statistics, refetch, loading: statsLoading } = useLostItems();

  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setListLoading(true);
      const res = await fetchFirstPage(
        "lost_items",
        "id,title,description,location_lost,contact_info,item_type,image_urls,created_at",
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
      "lost_items",
      cursor,
      "id,title,description,location_lost,contact_info,item_type,image_urls,created_at",
      20,
      "created_at"
    );
    setRows(prev => [...prev, ...res.data]);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
    setListLoading(false);
  };

  const handleItemCreated = async (newItemData: { 
    itemName: string; 
    location: string; 
    contactInfo: string; 
    description: string; 
    type: "lost" | "found"; 
    images: string[] 
  }) => {
    await createLostItem({
      title: newItemData.itemName,
      description: newItemData.description,
      location_lost: newItemData.location,
      contact_info: newItemData.contactInfo,
      item_type: newItemData.type,
      image_urls: newItemData.images.length > 0 ? newItemData.images : undefined,
    });
  };

  const filteredItems = rows.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location_lost?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = selectedLocation === "Tümü" || item.location_lost === selectedLocation;
    const matchesType = selectedType === "all" || item.item_type === selectedType;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "şimdi";
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  return (
    <div className={`min-h-screen bg-muted/30 ${isMobile ? 'pb-20' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Search className="w-8 h-8 mr-3" />
            Kayıp Eşya Paylaşımı
          </h1>
          <p className="text-primary-foreground/90">
            Kaybettiğin ya da bulduğun eşyaları paylaş, sahibini bul!
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
                  <Search className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-lg md:text-2xl font-bold text-orange-500">
                    {statsLoading ? <Skeleton className="h-6 md:h-8 w-8 mx-auto" /> : statistics.lost}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Kayıp</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <Eye className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-success" />
                  <div className="text-lg md:text-2xl font-bold text-success">
                    {statsLoading ? <Skeleton className="h-6 md:h-8 w-8 mx-auto" /> : statistics.found}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Bulundu</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-primary" />
                  <div className="text-lg md:text-2xl font-bold text-primary">
                    {statsLoading ? <Skeleton className="h-6 md:h-8 w-8 mx-auto" /> : statistics.locations}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Lokasyon</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4 text-center">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-primary-light" />
                  <div className="text-lg md:text-2xl font-bold text-primary-light">
                    {statsLoading ? <Skeleton className="h-6 md:h-8 w-8 mx-auto" /> : statistics.thisWeek}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Bu Hafta</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Eşya adı, açıklama veya lokasyon ara..."
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
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Lokasyon" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="min-w-[140px]">
                    <Select value={selectedType} onValueChange={(value) => setSelectedType(value as "all" | "lost" | "found")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="lost">Kayıp</SelectItem>
                        <SelectItem value="found">Bulundu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <Badge variant="secondary" className="ml-auto">
                {filteredItems.length} sonuç
              </Badge>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Sonuç Bulunamadı
            </h3>
            <p className="text-muted-foreground mb-4">
              Arama kriterlerinizle eşleşen bir eşya bulunamadı.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedLocation("Tümü");
                setSelectedType("all");
              }}
            >
              Filtreleri Temizle
            </Button>
          </Card>
        ) : listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
                <Skeleton className="aspect-video" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <LostItemCard 
                key={item.id}
                itemName={item.title}
                location={item.location_lost || "Bilinmiyor"}
                timestamp={formatTimestamp(item.created_at)}
                type={item.item_type}
                contactInfo={item.contact_info || ""}
                description={item.description}
                imageUrls={item.image_urls || []}
                userId={item.user_id}
                itemId={item.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KayipEsya;