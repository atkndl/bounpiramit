import { useState } from "react";
import { CreateLostItemDialog } from "@/components/CreateLostItemDialog";
import { LostItemCard } from "@/components/LostItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, Eye, Filter } from "lucide-react";

interface LostItem {
  itemName: string;
  location: string;
  timestamp: string;
  type: "lost" | "found";
  contactInfo: string;
  description: string;
  imageUrl?: string;
}

// Initial mock data
const initialLostItems: LostItem[] = [
  {
    itemName: "iPhone 13 Pro",
    location: "Güney Kampüs Kütüphanesi",
    timestamp: "3 saat önce",
    type: "lost" as const,
    contactInfo: "mehmet.oz@std.bogazici.edu.tr",
    description: "Siyah renk, mavi kılıflı. Kütüphanenin 2. katında unutmuşum. İçinde önemli dosyalar var.",
    imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400"
  },
  {
    itemName: "Matematik Kitabı - Calculus", 
    location: "ETA Binası",
    timestamp: "5 saat önce",
    type: "found" as const,
    contactInfo: "ayse.demir@std.bogazici.edu.tr",
    description: "Thomas Calculus kitabı, içinde el yazısı notlar var. ETA girişinde buldum.",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
  },
  {
    itemName: "Lacivert Cüzdan",
    location: "Hisar Boyu",  
    timestamp: "1 gün önce",
    type: "lost" as const,
    contactInfo: "can.yildiz@std.bogazici.edu.tr",
    description: "İçinde kimlik ve öğrenci kartı bulunan lacivert deri cüzdan. Hisar Boyu'nda yürürken düşürmüş olabilirim.",
  },
  {
    itemName: "AirPods Pro",
    location: "Güney Kampüs Kütüphanesi",
    timestamp: "1 gün önce", 
    type: "found" as const,
    contactInfo: "zeynep.kaya@std.bogazici.edu.tr",
    description: "Beyaz AirPods Pro ve şarj kutusunu 3. katta bir masada buldum. Sahibi kim?",
    imageUrl: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400"
  },
  {
    itemName: "Gri Kazak",
    location: "ETA A1 Sınıfı",
    timestamp: "2 gün önce",
    type: "lost" as const, 
    contactInfo: "fatma.celik@std.bogazici.edu.tr",
    description: "H&M marka gri kazak. A1 sınıfında ders sonrası unutmuşum. Üzerinde küçük logo var.",
  },
  {
    itemName: "Pembe Su Matarası",
    location: "Spor Salonu",
    timestamp: "2 gün önce",
    type: "found" as const,
    contactInfo: "ahmet.yilmaz@std.bogazici.edu.tr", 
    description: "Pembe renk su matarası, üzerinde sticker'lar var. Spor salonunda buldum.",
  },
  {
    itemName: "MacBook Şarj Aleti",
    location: "Kuzey Kampüs",
    timestamp: "3 gün önce",
    type: "lost" as const,
    contactInfo: "elif.ozkan@std.bogazici.edu.tr",
    description: "MacBook Pro için şarj aleti. Beyaz kablo ve adaptör. Kuzey kampüste kaybettim.",
  },
  {
    itemName: "Anahtarlık",
    location: "Merkezi Derslikler",
    timestamp: "3 gün önce", 
    type: "found" as const,
    contactInfo: "murat.demir@std.bogazici.edu.tr",
    description: "Üzerinde birkaç anahtar ve sarı bir kordon olan anahtarlık. Merkezi dersliklerde buldum.",
  },
  {
    itemName: "Siyah Çanta",
    location: "Yemekhane",
    timestamp: "4 gün önce",
    type: "lost" as const,
    contactInfo: "seda.yilmaz@std.bogazici.edu.tr", 
    description: "Orta boy siyah omuz çantası. İçinde defter ve kalemler vardı. Yemekhanede unutmuşum.",
  }
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Tümü");
  const [selectedType, setSelectedType] = useState<"all" | "lost" | "found">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [lostItems, setLostItems] = useState<LostItem[]>(initialLostItems);

  const addLostItem = (newItemData: { 
    itemName: string; 
    location: string; 
    contactInfo: string; 
    description: string; 
    type: "lost" | "found"; 
    images: string[] 
  }) => {
    const newItem: LostItem = {
      itemName: newItemData.itemName,
      location: newItemData.location,
      timestamp: "şimdi",
      type: newItemData.type,
      contactInfo: newItemData.contactInfo,
      description: newItemData.description,
      imageUrl: newItemData.images[0],
    };
    setLostItems(prev => [newItem, ...prev]);
  };

  const filteredItems = lostItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = selectedLocation === "Tümü" || item.location === selectedLocation;
    const matchesType = selectedType === "all" || item.type === selectedType;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const lostCount = lostItems.filter(item => item.type === "lost").length;
  const foundCount = lostItems.filter(item => item.type === "found").length;

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-success to-green-400 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Search className="w-8 h-8 mr-3" />
            Kayıp Eşya Paylaşımı
          </h1>
          <p className="text-white/90">
            Kaybettiğin ya da bulduğun eşyaları paylaş, sahibini bul!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats and Add Button */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Search className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-orange-500">{lostCount}</div>
                  <div className="text-sm text-muted-foreground">Kayıp</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="w-6 h-6 mx-auto mb-2 text-success" />
                  <div className="text-2xl font-bold text-success">{foundCount}</div>
                  <div className="text-sm text-muted-foreground">Bulundu</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-primary">{locations.length - 1}</div>
                  <div className="text-sm text-muted-foreground">Lokasyon</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-primary-light" />
                  <div className="text-2xl font-bold text-primary-light">24</div>
                  <div className="text-sm text-muted-foreground">Bu Hafta</div>
                </CardContent>
              </Card>
            </div>
            
            <CreateLostItemDialog onItemCreated={addLostItem} />
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <LostItemCard key={index} {...item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KayipEsya;