import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, MessageSquare, TrendingUp, BookOpen, Heart, Share2, MessageCircle } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { PostCard } from "@/components/PostCard";
import { supabase } from "@/integrations/supabase/client";

const trendingTopics = [
  "Final Hazırlığı",
  "Hackathon2024",
  "KampüsKedileri",
  "StudyGroup",
  "YazılımKulübü"
];

const Piramit = () => {
  const { posts, loading, createPost, fetchPosts } = usePosts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [realTimeStats, setRealTimeStats] = useState({
    activeStudents: 0,
    totalPosts: 0,
    todayPosts: 0,
  });

  useEffect(() => {
    fetchPosts("piramit");
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch active students (profiles created in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeStudentsCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Fetch total posts in piramit category
      const { count: totalPostsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("category", "piramit");

      // Fetch today's posts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayPostsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("category", "piramit")
        .gte("created_at", today.toISOString());

      setRealTimeStats({
        activeStudents: activeStudentsCount || 0,
        totalPosts: totalPostsCount || 0,
        todayPosts: todayPostsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handlePostCreated = async (data: { content: string; images: string[] }) => {
    await createPost(data.content, data.images);
    // Update stats after creating a post
    setRealTimeStats(prev => ({
      ...prev,
      totalPosts: prev.totalPosts + 1,
      todayPosts: prev.todayPosts + 1
    }));
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aktif Öğrenci</p>
                    <p className="text-2xl font-bold text-primary">{realTimeStats.activeStudents.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Gönderi</p>
                    <p className="text-2xl font-bold text-green-600">{realTimeStats.totalPosts.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bugünkü Gönderi</p>
                    <p className="text-2xl font-bold text-purple-600">{realTimeStats.todayPosts}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
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
                  <MessageSquare className="w-8 h-8 mx-auto mb-4 animate-spin" />
                  <p>Paylaşımlar yükleniyor...</p>
                </Card>
              ) : filteredPosts.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz paylaşım bulunamadı.</p>
                    <p className="text-sm mt-2">İlk paylaşımı siz yapın!</p>
                  </div>
                </Card>
              ) : (
                filteredPosts.map((post) => (
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
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center text-lg font-semibold">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Trending Konular
                </div>
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
                <div className="text-lg font-semibold">Topluluk Kuralları</div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Fikir özgürlüğünü destekliyoruz.</p>
                <p>• Spam yapmamaya özen gösteriyoruz.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Piramit;