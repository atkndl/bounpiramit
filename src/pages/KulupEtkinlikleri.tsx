import { useState } from "react";
import { Search, Grid, List, Users, TrendingUp, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EventCard } from "@/components/EventCard";

const categories = [
  { id: "all", label: "Tümü", color: "bg-primary" },
  { id: "academic", label: "Akademik", color: "bg-blue-500" },
  { id: "culture", label: "Kültür", color: "bg-purple-500" },
  { id: "technology", label: "Teknoloji", color: "bg-green-500" },
  { id: "art", label: "Sanat", color: "bg-pink-500" },
  { id: "sport", label: "Spor", color: "bg-orange-500" },
];

const mockEvents = [
  {
    id: 1,
    title: "Matematik Kulübü Semineri",
    clubName: "Matematik Kulübü",
    date: "20.12.2024",
    time: "14:00",
    location: "ETA Z17",
    description: "Linear Cebir konularında seminer ve soru çözümü",
    attendees: 24,
    maxAttendees: 40,
    category: "academic",
  },
  {
    id: 2,
    title: "Sinema Kulübü Film Gösterimi",
    clubName: "Sinema Kulübü",
    date: "20.12.2024",
    time: "19:00",
    location: "Albert Long Hall",
    description: "Bu hafta 'Inception' filmini izleyeceğiz ve sonrasında tartışacağız",
    attendees: 67,
    maxAttendees: 100,
    category: "culture",
  },
  {
    id: 3,
    title: "Robotik Kulübü Workshop",
    clubName: "Robotik Kulübü",
    date: "21.12.2024",
    time: "10:00",
    location: "Mühendislik Lab 3",
    description: "Arduino ile temel robotik programlama workshop",
    attendees: 18,
    maxAttendees: 25,
    category: "technology",
  },
  {
    id: 4,
    title: "Tiyatro Kulübü Prova",
    clubName: "Tiyatro Kulübü",
    date: "22.12.2024",
    time: "16:00",
    location: "Tiyatro Salonu",
    description: "Yeni oyunumuzun genel provası - izleyiciler hoş geldiniz",
    attendees: 12,
    maxAttendees: 50,
    category: "art",
  },
  {
    id: 5,
    title: "Fotoğrafçılık Gezisi",
    clubName: "Fotoğraf Kulübü",
    date: "23.12.2024",
    time: "09:00",
    location: "Ortaköy (Buluşma)",
    description: "İstanbul'un tarihi yerlerinde fotoğraf çekimi gezisi",
    attendees: 31,
    maxAttendees: 35,
    category: "art",
  },
];

export default function KulupEtkinlikleri() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalEvents = mockEvents.length;
  const totalAttendees = mockEvents.reduce((sum, event) => sum + event.attendees, 0);
  const upcomingEvents = mockEvents.filter(event => new Date(event.date.split('.').reverse().join('-')) >= new Date()).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Kulüp Etkinlikleri</h1>
              <p className="text-muted-foreground mt-1">Öğrenci kulüplerinin düzenlediği etkinlikler</p>
            </div>
            <div className="flex items-center space-x-2">
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
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
                  <p className="text-muted-foreground text-sm">Toplam Etkinlik</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalAttendees}</p>
                  <p className="text-muted-foreground text-sm">Toplam Katılımcı</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{upcomingEvents}</p>
                  <p className="text-muted-foreground text-sm">Yaklaşan Etkinlik</p>
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
            {categories.map((category) => (
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
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Etkinlik Bulunamadı</h3>
            <p className="text-muted-foreground">
              Arama kriterlerinize uygun etkinlik bulunamadı. Farklı kelimeler deneyin.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                clubName={event.clubName}
                date={event.date}
                time={event.time}
                location={event.location}
                description={event.description}
                attendees={event.attendees}
                category={categories.find(cat => cat.id === event.category)?.label}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}