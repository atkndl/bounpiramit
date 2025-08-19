import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateSportsDialog } from "@/components/CreateSportsDialog";
import { Plus, Search, Trophy, Users, Calendar, MapPin, Clock, Heart, MessageCircle, Share2 } from "lucide-react";

const sportsActivities = [
  {
    id: 1,
    title: "Futbol Turnuvası",
    category: "Futbol",
    type: "Turnuva",
    organizer: "Spor Kulübü",
    date: "25 Mart 2024",
    time: "14:00",
    location: "Spor Kompleksi",
    participants: "16/32",
    description: "Fakülteler arası futbol turnuvası. Kayıtlar devam ediyor!",
    image: "/placeholder.svg",
    likes: 24,
    comments: 8,
    shares: 3,
    tags: ["futbol", "turnuva", "spor"]
  },
  {
    id: 2,
    title: "Yoga Seansı",
    category: "Yoga",
    type: "Etkinlik",
    organizer: "Wellness Kulübü",
    date: "20 Mart 2024",
    time: "18:00",
    location: "Spor Salonu",
    participants: "12/20",
    description: "Haftalık yoga seansımıza katılın. Başlangıç seviyesi.",
    image: "/placeholder.svg",
    likes: 18,
    comments: 5,
    shares: 2,
    tags: ["yoga", "wellness", "meditasyon"]
  },
  {
    id: 3,
    title: "Fotoğrafçılık Gezisi",
    category: "Fotoğrafçılık",
    type: "Hobi",
    organizer: "Fotoğraf Kulübü",
    date: "30 Mart 2024",
    time: "09:00",
    location: "Bebek Koyu",
    participants: "8/15",
    description: "Doğa fotoğrafçılığı üzerine pratik yapalım.",
    image: "/placeholder.svg",
    likes: 31,
    comments: 12,
    shares: 7,
    tags: ["fotoğraf", "doğa", "gezi"]
  }
];

const categories = ["Tümü", "Futbol", "Basketbol", "Tenis", "Yüzme", "Yoga", "Fitness", "Fotoğrafçılık", "Müzik", "Sanat", "Teknoloji"];
const types = ["Tümü", "Turnuva", "Etkinlik", "Hobi", "Kurs", "Workshop"];

export default function SporHobi() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedType, setSelectedType] = useState("Tümü");
  const [activities, setActivities] = useState(sportsActivities);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || activity.category === selectedCategory;
    const matchesType = selectedType === "Tümü" || activity.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleCreateActivity = (newActivity: any) => {
    const activity = {
      id: activities.length + 1,
      ...newActivity,
      likes: 0,
      comments: 0,
      shares: 0
    };
    setActivities([activity, ...activities]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              Spor & Hobi
            </h1>
            <p className="text-muted-foreground mt-1">Spor etkinlikleri ve hobi aktivitelerini keşfet</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary-light text-white hover:opacity-90 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Etkinlik Ekle
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Aktif Etkinlik</p>
                  <p className="text-2xl font-bold">{activities.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Toplam Katılımcı</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Bu Hafta</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Kategori</p>
                  <p className="text-2xl font-bold">{categories.length - 1}</p>
                </div>
                <Search className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Etkinlik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Kategori seç" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Tür seç" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <img 
                  src={activity.image} 
                  alt={activity.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90 text-primary">
                    {activity.type}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-white/90 text-primary border-primary">
                    {activity.category}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-foreground">{activity.title}</h3>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Avatar className="w-6 h-6 mr-2">
                    <AvatarFallback className="text-xs">{activity.organizer[0]}</AvatarFallback>
                  </Avatar>
                  <span>{activity.organizer}</span>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {activity.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{activity.date}</span>
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    <span>{activity.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{activity.participants} katılımcı</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {activity.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{activity.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{activity.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">{activity.shares}</span>
                    </button>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Katıl
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <Card className="p-12 text-center shadow-card">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Etkinlik Bulunamadı</h3>
            <p className="text-muted-foreground">Aradığınız kriterlere uygun etkinlik bulunmuyor.</p>
          </Card>
        )}
      </div>

      <CreateSportsDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateActivity={handleCreateActivity}
      />
    </div>
  );
}