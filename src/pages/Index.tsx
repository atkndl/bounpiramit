import { QuickActions } from "@/components/QuickActions";
import { EventCard } from "@/components/EventCard";
import { PostCard } from "@/components/PostCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { LostItemCard } from "@/components/LostItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, TrendingUp, LogIn } from "lucide-react";

// Mock data - will be replaced with actual data later
const mockEvents = [
  {
    title: "Yazılım Geliştirme Atölyesi",
    clubName: "Bilgisayar Kulübü",
    date: "15 Aralık 2024",
    time: "14:00",
    location: "ETA A1",
    description: "React ve Node.js kullanarak full-stack web uygulaması geliştirme",
    attendees: 45,
    category: "Teknoloji"
  },
  {
    title: "Kış Konseri",
    clubName: "Müzik Kulübü",
    date: "18 Aralık 2024", 
    time: "19:30",
    location: "Albert Long Hall",
    description: "Klasik ve çağdaş eserlerin buluştuğu müzik ziyafeti",
    attendees: 120,
    category: "Müzik"
  }
];

const mockPosts = [
  {
    authorName: "Ahmet Yılmaz",
    authorEmail: "ahmet.yilmaz@std.bogazici.edu.tr",
    content: "Final haftası yaklaşırken herkese başarılar! Kütüphane çok kalabalık, grup çalışması için sessiz mekanlar arıyorum. Önerisi olan var mı?",
    timestamp: "2 saat önce",
    likes: 24,
    comments: 8,
    isLiked: false
  },
  {
    authorName: "Zeynep Kaya",
    authorEmail: "zeynep.kaya@std.bogazici.edu.tr",
    content: "Bugün kampüste gördüğüm kedinin fotoğrafını paylaşıyorum. O kadar tatlı ki! 🐱 Kampüsteki hayvanlar gerçekten çok şanslı.",
    timestamp: "4 saat önce",
    likes: 56,
    comments: 12,
    isLiked: true
  }
];

const mockAnnouncements = [
  {
    title: "Kış Tatili Duyurusu",
    content: "Kış tatili 23 Aralık 2024 tarihinde başlayacak ve 10 Şubat 2025 tarihinde sona erecektir. Detaylı bilgi için öğrenci işleri web sitesini ziyaret edin.",
    category: "Akademik",
    timestamp: "6 saat önce",
    priority: "high" as const,
    isNew: true
  },
  {
    title: "Yemekhanede Yeni Menü",
    content: "15 Aralık'tan itibaren yemekhanede yeni vegan seçenekler sunulmaya başlanacak. Beslenme uzmanlarımız tarafından hazırlanan menüler sağlıklı ve lezzetli.",
    category: "Kampüs",
    timestamp: "1 gün önce",
    priority: "medium" as const
  }
];

const mockLostItems = [
  {
    itemName: "iPhone 13 Pro",
    location: "Güney Kampüs Kütüphanesi",
    timestamp: "3 saat önce",
    type: "lost" as const,
    contactInfo: "mehmet.oz@std.bogazici.edu.tr",
    description: "Siyah renk, mavi kılıflı. Kütüphanenin 2. katında unutmuşum."
  },
  {
    itemName: "Matematik Kitabı", 
    location: "ETA Binası",
    timestamp: "5 saat önce",
    type: "found" as const,
    contactInfo: "ayse.demir@std.bogazici.edu.tr",
    description: "Calculus kitabı, içinde notlar var. ETA girişinde buldum."
  }
];

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {user ? `Hoş Geldin! 👋` : 'Boğaziçi Piramit'}
            </h1>
            <p className="text-primary-foreground/90">
              {user ? 'Bugün kampüste neler oluyor?' : 'Öğrenci topluluğunun merkezi'}
            </p>
          </div>
          {!user && (
            <Button 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => window.location.href = '/auth'}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Giriş Yap
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Events and Posts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Events */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>Bugünün Etkinlikleri</span>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Tümünü Gör <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockEvents.map((event, index) => (
                  <EventCard key={index} {...event} />
                ))}
              </CardContent>
            </Card>

            {/* Popular Posts */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Popüler Paylaşımlar</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Piramit'e Git <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockPosts.map((post, index) => (
                  <PostCard key={index} {...post} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Announcements and Lost Items */}
          <div className="space-y-8">
            {/* Announcements */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Duyurular</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Tümü <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAnnouncements.map((announcement, index) => (
                  <AnnouncementCard key={index} {...announcement} />
                ))}
              </CardContent>
            </Card>

            {/* Lost Items */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Son Kayıp Eşyalar</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Tümü <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockLostItems.map((item, index) => (
                  <LostItemCard key={index} {...item} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
