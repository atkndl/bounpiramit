import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, TrendingUp, Package, DollarSign, Users } from "lucide-react";

interface SaleItem {
  itemName: string;
  condition: string;
  price: number;
  location: string;
  timestamp: string;
  description: string;
  contactInfo: string;
  imageUrl?: string;
  category: string;
}

// Initial mock data
const initialSaleItems: SaleItem[] = [
  {
    itemName: "MacBook Air M1 13\"",
    condition: "Çok İyi",
    price: 8500,
    location: "Güney Kampüs",
    timestamp: "2 saat önce",
    description: "2021 model MacBook Air, 8GB RAM 256GB SSD. Çok az kullanıldı, kutusunda gelecek.",
    contactInfo: "ahmet.yilmaz@std.bogazici.edu.tr",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    category: "Elektronik"
  },
  {
    itemName: "Calculus Ders Kitabı",
    condition: "İyi",
    price: 120,
    location: "Kuzey Kampüs",
    timestamp: "4 saat önce",
    description: "Thomas Calculus 14. edisyon. İçinde notlar var ama temiz durumda.",
    contactInfo: "zeynep.kaya@std.bogazici.edu.tr",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    category: "Kitap"
  },
  {
    itemName: "Bisiklet - Trek FX 3",
    condition: "Çok İyi",
    price: 3200,
    location: "Hisar Boyu",
    timestamp: "1 gün önce",
    description: "2022 model Trek FX 3 hibrit bisiklet. Çok az kullanıldı, bakımları zamanında yapıldı.",
    contactInfo: "can.yildiz@std.bogazici.edu.tr",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    category: "Spor"
  },
  {
    itemName: "iPhone 12 Pro",
    condition: "İyi",
    price: 12000,
    location: "Güney Kampüs",
    timestamp: "1 gün önce",
    description: "128GB, Space Gray. Küçük çizikler var ama çalışması mükemmel.",
    contactInfo: "ayse.demir@std.bogazici.edu.tr",
    imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400",
    category: "Elektronik"
  },
  {
    itemName: "Koltuk Takımı",
    condition: "İyi",
    price: 2500,
    location: "Rumeli Hisarı",
    timestamp: "2 gün önce",
    description: "3+2+1 koltuk takımı. Temiz ve rahat. Ev değişimi nedeniyle satılık.",
    contactInfo: "mehmet.ozkan@std.bogazici.edu.tr",
    category: "Mobilya"
  },
  {
    itemName: "Gitar - Yamaha FG830",
    condition: "Çok İyi",
    price: 1800,
    location: "Etiler",
    timestamp: "3 gün önce",
    description: "Akustik gitar, çok az kullanıldı. Kılıfı ve pick'leri dahil.",
    contactInfo: "fatma.celik@std.bogazici.edu.tr",
    imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400",
    category: "Müzik"
  }
];

const conditions = ["Tümü", "Sıfır", "Çok İyi", "İyi", "Orta", "Kötü"];
const categories = ["Tümü", "Elektronik", "Kitap", "Spor", "Mobilya", "Müzik", "Giyim", "Diğer"];
const locations = ["Tümü", "Güney Kampüs", "Kuzey Kampüs", "Hisar Boyu", "Etiler", "Rumeli Hisarı"];

const EsyaSatis = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("Tümü");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedLocation, setSelectedLocation] = useState("Tümü");
  const [showFilters, setShowFilters] = useState(false);
  const [saleItems, setSaleItems] = useState<SaleItem[]>(initialSaleItems);

  const filteredItems = saleItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCondition = selectedCondition === "Tümü" || item.condition === selectedCondition;
    const matchesCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
    const matchesLocation = selectedLocation === "Tümü" || item.location === selectedLocation;
    
    return matchesSearch && matchesCondition && matchesCategory && matchesLocation;
  });

  const averagePrice = Math.round(saleItems.reduce((sum, item) => sum + item.price, 0) / saleItems.length);
  const totalItems = saleItems.length;

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Package className="w-8 h-8 mr-3" />
            Eşya Alım/Satım
          </h1>
          <p className="text-white/90">
            Öğrencilerden öğrencilere güvenli alışveriş platformu
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
                  <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-primary">{totalItems}</div>
                  <div className="text-sm text-muted-foreground">Aktif İlan</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-success" />
                  <div className="text-2xl font-bold text-success">₺{averagePrice}</div>
                  <div className="text-sm text-muted-foreground">Ort. Fiyat</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary-light" />
                  <div className="text-2xl font-bold text-primary-light">{categories.length - 1}</div>
                  <div className="text-sm text-muted-foreground">Kategori</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-orange-500">147</div>
                  <div className="text-sm text-muted-foreground">Bu Ay</div>
                </CardContent>
              </Card>
            </div>
            
            <Button className="bg-gradient-to-r from-primary to-primary-light hover:opacity-90 text-white">
              <Package className="w-4 h-4 mr-2" />
              Eşya İlanı Ekle
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Eşya adı, açıklama ara..."
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
                  <div className="min-w-[140px]">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="min-w-[130px]">
                    <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
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
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Sonuç Bulunamadı
            </h3>
            <p className="text-muted-foreground mb-4">
              Arama kriterlerinizle eşleşen bir ilan bulunamadı.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Tümü");
                setSelectedCondition("Tümü");
                setSelectedLocation("Tümü");
              }}
            >
              Filtreleri Temizle
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                {item.imageUrl && (
                  <div className="aspect-video bg-muted">
                    <img 
                      src={item.imageUrl} 
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                        {item.itemName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            item.condition === "Sıfır" ? "bg-success text-white" :
                            item.condition === "Çok İyi" ? "bg-primary/20 text-primary" :
                            item.condition === "İyi" ? "bg-orange-100 text-orange-800" :
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.condition}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">
                        ₺{item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Search className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {item.timestamp}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      İletişim
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EsyaSatis;