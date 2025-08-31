import { QuickActions } from "@/components/QuickActions";
import { CampusDensity } from "@/components/CampusDensity";
import { EventCard } from "@/components/EventCard";
import { PostCard } from "@/components/PostCard";
import { LostItemCard } from "@/components/LostItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { useLostItems } from "@/hooks/useLostItems";
import { useMarketplace } from "@/hooks/useMarketplace";
import { ArrowRight, TrendingUp, LogIn, ShoppingBag, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

// Real data will be fetched from database

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchPopularPosts } = usePosts();
  const { lostItems } = useLostItems();
  const { items: marketplaceItems } = useMarketplace();
  const [popularPosts, setPopularPosts] = useState<any[]>([]);

  useEffect(() => {
    const loadPopularPosts = async () => {
      const posts = await fetchPopularPosts(2);
      setPopularPosts(posts);
    };
    
    loadPopularPosts();
  }, []);

  // Get latest 2 items from each category
  const latestLostItems = lostItems.slice(0, 2);
  const latestMarketplaceItems = marketplaceItems.slice(0, 2);
  
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

        {/* Campus Density */}
        <CampusDensity />

        {/* Top Row - Popular Posts and Lost Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Posts */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Popüler Paylaşımlar</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => navigate('/piramit')}
              >
                Piramit'e Git <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {popularPosts.length > 0 ? (
                popularPosts.map((post) => (
                  <PostCard 
                    key={post.id}
                    postId={post.id}
                    authorId={post.user_id}
                    content={post.content}
                    timestamp={new Date(post.created_at).toLocaleString('tr-TR')}
                    likes={post.likes_count}
                    comments={post.comments_count}
                    imageUrls={post.image_urls}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Henüz popüler paylaşım bulunmuyor
                </p>
              )}
            </CardContent>
          </Card>

          {/* Lost Items */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-primary" />
                <span>Son Kayıp Eşyalar</span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => navigate('/kayip-esya')}
              >
                Tümü <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestLostItems.length > 0 ? (
                latestLostItems.map((item) => (
                <LostItemCard 
                  key={item.id} 
                  itemName={item.title}
                  location={item.location_lost || "Belirtilmemiş"}
                  timestamp={new Date(item.created_at).toLocaleDateString('tr-TR')}
                  type={item.item_type as "lost" | "found"}
                  contactInfo={item.contact_info || "Belirtilmemiş"}
                  description={item.description}
                  imageUrls={item.image_urls}
                />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Henüz kayıp eşya ilanı bulunmuyor
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Events and Marketplace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>Bugünün Etkinlikleri</span>
                <TrendingUp className="w-5 h-5 text-primary" />
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => navigate('/kulup-etkinlikleri')}
              >
                Tümünü Gör <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockEvents.map((event, index) => (
                <EventCard key={index} {...event} />
              ))}
            </CardContent>
          </Card>

          {/* Marketplace Items */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span>Son Eşya Satışları</span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => navigate('/esya-satis')}
              >
                Tümü <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestMarketplaceItems.length > 0 ? (
                latestMarketplaceItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    {item.image_urls && item.image_urls[0] ? (
                      <img 
                        src={item.image_urls[0]} 
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.price ? `₺${item.price}` : "Fiyat Belirtilmemiş"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Henüz eşya satış ilanı bulunmuyor
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
