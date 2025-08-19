import { useState, useEffect } from "react";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Users, MessageCircle, Loader2 } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";

const trendingTopics = [
  "Final Hazırlığı",
  "Hackathon2024",
  "KampüsKedileri",
  "StudyGroup",
  "YazılımKulübü"
];

const Piramit = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { posts, loading, fetchPosts, createPost } = usePosts();

  useEffect(() => {
    fetchPosts('piramit');
  }, []);

  const handlePostCreated = async (data: { content: string; images: string[] }) => {
    await createPost(data.content, data.images);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <MessageCircle className="w-8 h-8 mr-3" />
            Piramit
          </h1>
          <p className="text-primary-foreground/90">
            Öğrenci topluluğunun nabzını burada tutun! Düşüncelerinizi paylaşın.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Search and Stats */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Paylaşımlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary">1,247</div>
                <div className="text-sm text-muted-foreground">Aktif Öğrenci</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-primary-light" />
                <div className="text-2xl font-bold text-primary-light">3,892</div>
                <div className="text-sm text-muted-foreground">Toplam Paylaşım</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
                <div className="text-2xl font-bold text-success">124</div>
                <div className="text-sm text-muted-foreground">Bugün Paylaşılan</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <CreatePostDialog onPostCreated={handlePostCreated} />

            {/* Posts Feed */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                Son Paylaşımlar
                <Badge variant="secondary" className="ml-2">
                  {filteredPosts.length}
                </Badge>
              </h2>
              
              {loading ? (
                <Card className="p-8 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                  <p>Paylaşımlar yükleniyor...</p>
                </Card>
              ) : filteredPosts.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz paylaşım bulunamadı.</p>
                    <p className="text-sm mt-2">İlk paylaşımı siz yapın!</p>
                  </div>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard 
                    key={post.id}
                    postId={post.id}
                    authorName={post.profiles?.full_name || "Anonim"}
                    authorEmail={post.profiles?.email || ""}
                    content={post.content}
                    timestamp={new Date(post.created_at).toLocaleString('tr-TR')}
                    likes={post.likes_count}
                    comments={post.comments_count}
                    imageUrls={post.image_urls}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Trending Konular
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTag(selectedTag === topic ? null : topic)}
                    className={`block w-full text-left p-2 rounded-lg transition-colors text-sm ${
                      selectedTag === topic
                        ? "bg-primary text-white"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    #{topic}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Topluluk Kuralları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Saygılı ve yapıcı olun</p>
                <p>• Spam yapmayın</p>
                <p>• Akademik kurallara uyun</p>
                <p>• Kişisel saldırılarda bulunmayın</p>
                <p>• Çok dil kullanmayın</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Piramit;