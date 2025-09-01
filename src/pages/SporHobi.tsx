import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateSportsActivityDialog } from "@/components/CreateSportsActivityDialog";
import { ContactPopover } from "@/components/ContactPopover";
import { ProfilePopover } from "@/components/ProfilePopover";
import { useSportsActivities } from "@/hooks/useSportsActivities";
import { useAuth } from "@/hooks/useAuth";
import { useDisplayName } from "@/hooks/useDisplayName";
import { Plus, Search, Trophy, Users, Calendar, MapPin, Clock, MessageCircle, Phone } from "lucide-react";
import { fetchFirstPage, fetchNextPage } from "@/lib/pagination";
const categories = ["Tümü", "Futbol", "Basketbol", "Tenis", "Yüzme", "Yoga", "Fitness", "OKEY101", "Tavla", "Satranç", "Kutu Oyunu", "Fotoğrafçılık", "Müzik", "Sanat", "Teknoloji"];
const types = ["Tümü", "Turnuva", "Etkinlik", "Hobi", "Kurs", "Workshop"];

// Category colors for the colored strips
const categoryColors: Record<string, string> = {
  "Futbol": "bg-green-500",
  "Basketbol": "bg-orange-500",
  "Tenis": "bg-yellow-500",
  "Yüzme": "bg-blue-500",
  "Yoga": "bg-purple-500",
  "Fitness": "bg-red-500",
  "OKEY101": "bg-red-600",
  "Tavla": "bg-amber-600",
  "Satranç": "bg-gray-700",
  "Kutu Oyunu": "bg-pink-500",
  "Fotoğrafçılık": "bg-indigo-500",
  "Müzik": "bg-violet-500",
  "Sanat": "bg-rose-500",
  "Teknoloji": "bg-cyan-500",
  "other": "bg-gray-500"
};
export default function SporHobi() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedType, setSelectedType] = useState("Tümü");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { createActivity, markAsInactive } = useSportsActivities();
  const { user } = useAuth();

  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setListLoading(true);
      const res = await fetchFirstPage(
        "sports_activities",
        "id,title,description,location,category,activity_type,is_active,current_participants,organizer,activity_date,activity_time,user_id,contact_info,image_url,max_participants",
        20,
        "activity_date"
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
      "sports_activities",
      cursor,
      "id,title,description,location,category,activity_type,is_active,current_participants,organizer,activity_date,activity_time,user_id,contact_info,image_url,max_participants",
      20,
      "activity_date"
    );
    setRows(prev => [...prev, ...res.data]);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
    setListLoading(false);
  };

  const filteredActivities = rows.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || (activity.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || activity.category === selectedCategory;
    const matchesType = selectedType === "Tümü" || activity.activity_type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });
  const handleCreateActivity = async (newActivity: any) => {
    await createActivity(newActivity);
    setIsCreateDialogOpen(false);
  };
  const handleMarkAsInactive = async (activityId: string) => {
    await markAsInactive(activityId);
  };

  const activeActivities = rows.length;
  const totalParticipants = rows.reduce((sum, activity) => sum + (activity.current_participants || 0), 0);
  const thisWeekActivities = rows.filter(activity => {
    if (!activity.activity_date) return false;
    const activityDate = new Date(activity.activity_date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return activityDate >= weekAgo && activityDate <= now;
  }).length;
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Trophy className="w-8 h-8 mr-3" />
            Hobi & Spor
          </h1>
          <p className="text-primary-foreground/90">
            Spor ve hobi aktivitelerine katıl
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div></div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aktivite Ekle
            </Button>
          </div>
        </div>
        {/* Stats Cards */}
        {listLoading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
            {[...Array(4)].map((_, i) => <Card key={i}>
                <CardContent className="p-3 md:p-4">
                  <Skeleton className="h-12 md:h-16 w-full" />
                </CardContent>
              </Card>)}
          </div> : <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs md:text-sm">Aktif Etkinlik</p>
                    <p className="text-lg md:text-2xl font-bold">{activeActivities}</p>
                  </div>
                  <Calendar className="w-5 h-5 md:w-8 md:h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs md:text-sm">Toplam Katılımcı</p>
                    <p className="text-lg md:text-2xl font-bold">{totalParticipants}</p>
                  </div>
                  <Users className="w-5 h-5 md:w-8 md:h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs md:text-sm">Bu Hafta</p>
                    <p className="text-lg md:text-2xl font-bold">{thisWeekActivities}</p>
                  </div>
                  <Trophy className="w-5 h-5 md:w-8 md:h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs md:text-sm">Kategori</p>
                    <p className="text-lg md:text-2xl font-bold">{categories.length - 1}</p>
                  </div>
                  <Search className="w-5 h-5 md:w-8 md:h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>}

        {/* Filters */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input placeholder="Etkinlik ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Kategori seç" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Tür seç" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities Grid */}
        {listLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Card key={i} className="shadow-card border-2 border-border/40">
                <Skeleton className="w-full h-48 rounded-t-lg" />
                <CardContent className="p-4 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>)}
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map(activity => {
              const SportsActivityCard = ({ activity }: { activity: any }) => {
                const { displayName } = useDisplayName(activity.user_id);
                
                return (
                  <Card key={activity.id} className="shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border-2 border-border/40 hover:border-border/60">
                    <div className="relative">
                      {/* Colored strip at the top */}
                      <div className={`h-3 w-full ${categoryColors[activity.category] || categoryColors["other"]}`}></div>
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 text-primary my-[4px]">
                          {activity.activity_type}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-white/90 text-primary border-primary my-[7px] py-[2px]">
                          {activity.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-foreground my-[9px]">{activity.title}</h3>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <ProfilePopover userId={activity.user_id} />
                        <span className="text-sm text-muted-foreground">{displayName}</span>
                      </div>
                      
                      {activity.organizer && <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarFallback className="text-xs">{activity.organizer[0]}</AvatarFallback>
                          </Avatar>
                          <span>{activity.organizer}</span>
                        </div>}

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {activity.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {activity.activity_date && <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(activity.activity_date).toLocaleDateString('tr-TR')}</span>
                        {activity.activity_time && <>
                            <Clock className="w-4 h-4 ml-4 mr-2" />
                            <span>{activity.activity_time}</span>
                          </>}
                      </div>}
                    {activity.location && <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{activity.location}</span>
                      </div>}
                    {activity.max_participants && <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{activity.current_participants}/{activity.max_participants} katılımcı</span>
                      </div>}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">0</span>
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      {user && user.id === activity.user_id && <Button size="sm" variant="destructive" onClick={() => handleMarkAsInactive(activity.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white">
                          Pasif Yap
                        </Button>}
                      {activity.contact_info && (
                        <ContactPopover contactInfo={activity.contact_info} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          };
          
          return <SportsActivityCard key={activity.id} activity={activity} />;
          })}
          </div>}

        {filteredActivities.length === 0 && (
          <Card className="p-12 text-center shadow-card">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Etkinlik Bulunamadı</h3>
            <p className="text-muted-foreground">Aradığınız kriterlere uygun etkinlik bulunmuyor.</p>
          </Card>
        )}
      </div>
      
      <CreateSportsActivityDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        onCreateActivity={handleCreateActivity} 
      />
    </div>
  );
}