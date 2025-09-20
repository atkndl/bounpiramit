import { useState, useEffect } from "react";
import { Search, Grid, List, Users, TrendingUp, Calendar, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClubEventCard } from "@/components/ClubEventCard";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { useAuth } from "@/hooks/useAuth";
import { fetchFirstPage, fetchNextPage } from "@/lib/pagination";

const eventCategories = [
  { id: "all", label: "Tümü", color: "bg-primary" },
  { id: "academic", label: "Akademik", color: "bg-blue-500" },
  { id: "culture", label: "Kültür", color: "bg-purple-500" },
  { id: "technology", label: "Teknoloji", color: "bg-green-500" },
  { id: "art", label: "Sanat", color: "bg-pink-500" },
  { id: "sport", label: "Spor", color: "bg-orange-500" },
  { id: "club", label: "Kulüp", color: "bg-primary" },
  { id: "music", label: "Müzik", color: "bg-indigo-500" },
  { id: "social", label: "Sosyal", color: "bg-yellow-500" },
  { id: "other", label: "Diğer", color: "bg-gray-500" }
];

export default function KulupEtkinlikleri() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await fetchFirstPage(
        "events",
        "id,title,description,location,category,event_date,current_participants,max_participants,image_urls,tags,user_id,created_at",
        20,
        "event_date"
      );
      if (!mounted) return;
      setEvents(res.data);
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const res = await fetchNextPage(
      "events",
      cursor,
      "id,title,description,location,category,event_date,current_participants,max_participants,image_urls,tags,user_id,created_at",
      20,
      "event_date"
    );
    setEvents(prev => [...prev, ...res.data]);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
    setLoading(false);
  };

  const deleteEvent = async (id: string) => {
    // Simple local deletion - you may want to add proper API call
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalEvents = events.length;
  const totalAttendees = events.reduce((sum, event) => sum + event.current_participants, 0);
  const upcomingEvents = events.filter(event => new Date(event.event_date) >= new Date()).length;

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      deleteEvent(id);
    }
  };

  const getClubNameFromTags = (tags: string[] | null): string => {
    if (!tags || tags.length === 0) return "Öğrenci Kulübü";
    return tags[tags.length - 1] || "Öğrenci Kulübü";
  };

  const getDetailUrlFromDescription = (description: string | null): string | null => {
    if (!description) return null;
    const linkMatch = description.match(/Detay Linki: (https?:\/\/[^\s\n]+)/);
    return linkMatch ? linkMatch[1] : null;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Calendar className="w-8 h-8 mr-3" />
            Kulüp Etkinlikleri
          </h1>
          <p className="text-primary-foreground/90">
            Öğrenci kulüplerinin düzenlediği etkinlikler
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div></div>
          <div className="flex items-center space-x-2">
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Etkinlik Ekle
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* İstatistikler */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 mb-4 md:mb-8">
          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1 md:p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{loading ? '...' : totalEvents}</p>
                  <p className="text-muted-foreground text-xs md:text-sm">Toplam Etkinlik</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1 md:p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{loading ? '...' : totalAttendees}</p>
                  <p className="text-muted-foreground text-xs md:text-sm">Toplam Katılımcı</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1 md:p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{loading ? '...' : upcomingEvents}</p>
                  <p className="text-muted-foreground text-xs md:text-sm">Yaklaşan Etkinlik</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arama ve Filtreler */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Etkinlik, kulüp veya konu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {eventCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Etkinlik Listesi */}
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-6 w-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Etkinlik Bulunamadı</h3>
            <p className="text-muted-foreground">
              Arama kriterlerinize uygun etkinlik bulunamadı. Farklı kelimeler deneyin.
            </p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {filteredEvents.map((event) => (
                <ClubEventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  location={event.location}
                  category={event.category}
                  eventDate={event.event_date}
                  currentParticipants={event.current_participants}
                  maxParticipants={event.max_participants}
                  imageUrls={event.image_urls}
                  detailUrl={getDetailUrlFromDescription(event.description)}
                  clubName={getClubNameFromTags(event.tags)}
                  onDelete={isAdmin ? handleDeleteEvent : undefined}
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button onClick={loadMore} disabled={loading}>
                  {loading ? "Yükleniyor..." : "Daha Fazla"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={() => {
          // Event list will be refreshed automatically via the hook
        }}
      />
    </div>
  );
}