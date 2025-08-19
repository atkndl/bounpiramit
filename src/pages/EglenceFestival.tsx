import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Music, Calendar, MapPin, Users, Plus, Search, Filter, Heart, MessageCircle, Star } from "lucide-react";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: "Konser" | "Festival" | "Parti" | "Sahne" | "DJ Set" | "Diğer";
  image: string;
  attendees: number;
  maxAttendees?: number;
  price?: number;
  isLiked: boolean;
  likes: number;
  createdAt: string;
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Boğaziçi Bahar Festivali 2024",
    organizer: "Boğaziçi Üniversitesi",
    date: "2024-04-15",
    time: "14:00",
    location: "Güney Kampüs",
    description: "Geleneksel bahar festivali! Müzik, oyunlar ve eğlence dolu bir gün.",
    category: "Festival",
    image: "/placeholder.svg",
    attendees: 156,
    maxAttendees: 500,
    isLiked: true,
    likes: 89,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    title: "Açık Hava Konseri",
    organizer: "Müzik Kulübü",
    date: "2024-04-20",
    time: "19:00",
    location: "Albert Long Hall Bahçesi",
    description: "Yerel müzisyenlerin sahne alacağı açık hava konseri.",
    category: "Konser",
    image: "/placeholder.svg",
    attendees: 67,
    maxAttendees: 200,
    isLiked: false,
    likes: 34,
    createdAt: "2024-01-14"
  }
];

export default function EglenceFestival() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Tümü" | Event["category"]>("Tümü");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const categories = ["Tümü", "Konser", "Festival", "Parti", "Sahne", "DJ Set", "Diğer"];

  const handleLike = (id: string) => {
    setEvents(events.map(event => 
      event.id === id 
        ? { ...event, isLiked: !event.isLiked, likes: event.isLiked ? event.likes - 1 : event.likes + 1 }
        : event
    ));
  };

  const handleAttend = (id: string) => {
    setEvents(events.map(event => 
      event.id === id 
        ? { ...event, attendees: event.attendees + 1 }
        : event
    ));
    toast.success("Etkinliğe katılım sağlandı!");
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateEvent = (eventData: any) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventData.title,
      organizer: eventData.organizer,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      description: eventData.description,
      category: eventData.category,
      image: eventData.image || "/placeholder.svg",
      attendees: 0,
      maxAttendees: eventData.maxAttendees,
      price: eventData.price,
      isLiked: false,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    setEvents([newEvent, ...events]);
    setIsCreateDialogOpen(false);
    toast.success("Etkinlik başarıyla eklendi!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Eğlence & Festival
            </h1>
            <p className="text-muted-foreground mt-2">
              Kampüsteki eğlenceli etkinlikleri keşfet
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Etkinlik Ekle
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Etkinlik</p>
                  <p className="text-2xl font-bold text-primary">{events.length}</p>
                </div>
                <Music className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bu Hafta</p>
                  <p className="text-2xl font-bold text-accent">
                    {events.filter(e => {
                      const eventDate = new Date(e.date);
                      const now = new Date();
                      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return eventDate >= now && eventDate <= weekFromNow;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-secondary/10 to-secondary/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Katılımcı</p>
                  <p className="text-2xl font-bold text-secondary-foreground">
                    {events.reduce((sum, e) => sum + e.attendees, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-success/10 to-success/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Popüler</p>
                  <p className="text-2xl font-bold text-success">
                    {Math.max(...events.map(e => e.likes), 0)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-success" />
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
                    placeholder="Etkinlik, organizatör veya konum ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category as any)}
                    className="min-w-[80px]"
                    size="sm"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge 
                  className="absolute top-3 right-3 bg-primary text-white"
                >
                  {event.category}
                </Badge>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-1 text-primary" />
                    <span className="font-medium">{new Date(event.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  Organizatör: {event.organizer}
                </p>
                
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{event.location}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground mb-3">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {event.attendees} katılımcı
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(event.id)}
                      className={`h-8 ${event.isLiked ? 'text-success hover:text-success' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${event.isLiked ? 'fill-current' : ''}`} />
                      {event.likes}
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAttend(event.id)}
                    className="text-sm border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  >
                    Katıl
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Etkinlik bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerinize uygun etkinlik bulunamadı. Farklı anahtar kelimeler deneyin.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
}