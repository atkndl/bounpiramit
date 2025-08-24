import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Music, Calendar, MapPin, Users, Plus, Search, Filter, Heart, MessageCircle, Star, Loader2 } from "lucide-react";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { useEvents } from "@/hooks/useEvents";
import { toast } from "sonner";

const categoryMap: Record<string, string> = {
  club: "Kulüp",
  music: "Müzik",
  sports: "Spor",
  academic: "Akademik",
  social: "Sosyal",
  other: "Diğer"
};

export default function EglenceFestival() {
  const { events, loading, joinEvent } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const categories = ["Tümü", "Kulüp", "Müzik", "Spor", "Akademik", "Sosyal", "Diğer"];

  const handleAttend = async (id: string) => {
    try {
      await joinEvent(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const eventCategory = categoryMap[event.category] || event.category;
      const matchesCategory = selectedCategory === "Tümü" || eventCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Eğlence & Festival</h1>
              <p className="text-muted-foreground mt-1">Kampüsteki eğlenceli etkinlikleri keşfet</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Etkinlik Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

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
                      const eventDate = new Date(e.event_date);
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
                    {events.reduce((sum, e) => sum + e.current_participants, 0)}
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
                  <p className="text-sm text-muted-foreground">Bu Ay</p>
                  <p className="text-2xl font-bold text-success">
                    {events.filter(e => {
                      const eventDate = new Date(e.event_date);
                      const now = new Date();
                      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
                    }).length}
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Etkinlikler yükleniyor...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.event_date);
              const imageUrl = event.image_urls && event.image_urls.length > 0 
                ? event.image_urls[0] 
                : "/placeholder.svg";
              
              return (
                <Card key={event.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt={event.title}
                      className="w-full h-48 object-contain bg-muted group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge 
                      className="absolute top-3 right-3 bg-primary text-white"
                    >
                      {categoryMap[event.category] || event.category}
                    </Badge>
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-1 text-primary" />
                        <span className="font-medium">{eventDate.toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{event.location || "Konum belirtilmemiş"}</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground mb-3">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {event.current_participants} katılımcı
                        {event.max_participants && ` / ${event.max_participants}`}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description || "Açıklama bulunmuyor"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAttend(event.id)}
                        className="text-sm border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                        disabled={event.max_participants && event.current_participants >= event.max_participants}
                      >
                        {event.max_participants && event.current_participants >= event.max_participants ? "Dolu" : "Katıl"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

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
        onSubmit={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}