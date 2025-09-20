import { useState, useEffect, useMemo } from 'react';
import { useEventParticipants } from '@/hooks/useEventParticipants';
import { UserProfile } from '@/components/UserProfile';
import { fetchFirstPage, fetchNextPage } from '@/lib/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreateEventDialog } from '@/components/CreateEventDialog';
import { ImageGallery } from '@/components/ImageGallery';
import { CalendarDays, MapPin, Users, Clock, Search, Filter, Plus, Music, Loader2, Calendar, Star } from 'lucide-react';

const categoryMap: Record<string, string> = {
  club: "Kulüp",
  music: "Müzik", 
  sports: "Spor",
  academic: "Akademik",
  social: "Sosyal",
  other: "Diğer"
};

const EglenceFestival = () => {
  const { hasJoined, toggleParticipation, loading: participationLoading } = useEventParticipants();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Initial data fetch
  useEffect(() => {
    const fetchFirstPageData = async () => {
      setLoading(true);
      try {
        const result = await fetchFirstPage(
          "events",
          "id,title,description,location,category,event_date,current_participants,max_participants,image_urls,tags,user_id,created_at",
          20,
          "event_date"
        );
        setEvents(result.data);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
        setTotalCount(result.count);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstPageData();
  }, []);

  // Load more function
  const loadMore = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const result = await fetchNextPage(
        "events",
        nextCursor,
        "id,title,description,location,category,event_date,current_participants,max_participants,image_urls,tags,user_id,created_at",
        20,
        "event_date"
      );
      setEvents(prevEvents => [...prevEvents, ...result.data]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle attend button click
  const handleAttend = async (eventId: string) => {
    await toggleParticipation(eventId);
    // Optionally refresh the events list to get updated participant counts
    // But since we're using optimistic updates in the hook, this might not be necessary
  };

  const categories = ["Tümü", "Kulüp", "Müzik", "Spor", "Akademik", "Sosyal", "Diğer"];

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const eventCategory = categoryMap[event.category] || event.category;
      const matchesCategory = selectedCategory === "Tümü" || selectedCategory === "" || eventCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Music className="w-8 h-8 mr-3" />
            Eğlence & Festival
          </h1>
          <p className="text-primary-foreground/90">
            Kampüsteki eğlenceli etkinlikleri keşfet
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div></div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Toplam Etkinlik</p>
                  <p className="text-lg md:text-2xl font-bold text-primary">{totalCount}</p>
                </div>
                <Music className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Bu Hafta</p>
                  <p className="text-lg md:text-2xl font-bold text-accent">
                    {events.filter(e => {
                      const eventDate = new Date(e.event_date);
                      const now = new Date();
                      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return eventDate >= now && eventDate <= weekFromNow;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-5 h-5 md:w-8 md:h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-secondary/10 to-secondary/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Toplam Katılımcı</p>
                  <p className="text-lg md:text-2xl font-bold text-secondary-foreground">
                    {events.reduce((sum, e) => sum + e.current_participants, 0)}
                  </p>
                </div>
                <Users className="w-5 h-5 md:w-8 md:h-8 text-secondary-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-500/10 to-green-500/5 hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Bu Ay</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">
                    {events.filter(e => {
                      const eventDate = new Date(e.event_date);
                      const now = new Date();
                      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Star className="w-5 h-5 md:w-8 md:h-8 text-green-600" />
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
                    onClick={() => setSelectedCategory(category === "Tümü" ? "" : category)}
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
        {loading && events.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Etkinlikler yükleniyor...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.event_date);
                const isToday = eventDate.toDateString() === new Date().toDateString();
                
                return (
                  <Card 
                    key={event.id} 
                    className="overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary bg-white"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <UserProfile userId={event.user_id} />
                        </div>
                        <Badge variant={isToday ? "default" : "secondary"} className="text-xs">
                          {categoryMap[event.category] || event.category}
                        </Badge>
                      </div>
                      
                      <h3 className="font-bold text-xl text-foreground leading-tight line-clamp-2">
                        {event.title}
                      </h3>
                    </CardHeader>

                    <CardContent className="p-4 pt-0">
                      {/* Event Images */}
                      {event.image_urls && event.image_urls.length > 0 ? (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <ImageGallery images={event.image_urls} title={event.title} />
                        </div>
                      ) : (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <div className="w-full aspect-video bg-muted flex items-center justify-center">
                            <div className="text-muted-foreground text-sm flex flex-col items-center">
                              <Music className="w-8 h-8 mb-2" />
                              Resim Yok
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Event Details */}
                      <div className="space-y-3">
                        {/* Location */}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {event.location || "Konum belirtilmemiş"}
                          </span>
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {eventDate.toLocaleDateString('tr-TR')} - {eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Participants */}
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {event.current_participants} katılımcı
                            {event.max_participants && ` / ${event.max_participants}`}
                          </span>
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>

                      <Separator className="my-4" />

                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <Button
                          variant={hasJoined(event.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAttend(event.id)}
                          className={`text-sm ${hasJoined(event.id) 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                            : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                          }`}
                          disabled={participationLoading || (event.max_participants && event.current_participants >= event.max_participants)}
                        >
                          {event.max_participants && event.current_participants >= event.max_participants 
                            ? "Dolu" 
                            : hasJoined(event.id) 
                              ? "Katıldın" 
                              : "Katıl"
                          }
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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

        {filteredEvents.length === 0 && !loading && (
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
};

export default EglenceFestival;