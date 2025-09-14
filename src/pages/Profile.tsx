import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, User, Heart, Bookmark, Edit, Trash2, FileText, MessageSquare, Eye, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLikes } from "@/hooks/useLikes";
import { useFavorites } from "@/hooks/useFavorites";
import { useIsMobile } from "@/hooks/use-mobile";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  bio?: string;
  department?: string;
  year?: number;
  student_number?: string;
  avatar_url?: string;
  email_visibility?: boolean;
  name_display_style?: 'full' | 'abbreviated';
}

interface LikedItem {
  id: string;
  post_id: string;
  created_at: string;
  posts?: {
    title: string;
    content: string;
    category: string;
  };
}

interface FavoriteItem {
  id: string;
  item_id: string;
  item_type: string;
  created_at: string;
  posts?: {
    id: string;
    title: string;
    content: string;
    category: string;
  } | null;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });

  const { toggleLike } = useLikes();
  const { toggleFavorite } = useFavorites();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLikedItems();
      fetchFavoriteItems();
      fetchUserPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Profil bilgileri yüklenemedi");
    }
  };

  const fetchLikedItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("likes")
        .select(`
          *,
          posts:post_id (title, content, category)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLikedItems(data || []);
    } catch (error) {
      console.error("Error fetching liked items:", error);
      toast.error("Beğenilen içerikler yüklenemedi");
    }
  };

  const fetchFavoriteItems = async () => {
    if (!user) return;
    
    try {
      // Get all favorites regardless of type
      const { data: favorites, error: favError } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (favError) throw favError;

      if (favorites && favorites.length > 0) {
        // Separate favorites by type and get related data
        const postFavorites = favorites.filter(f => f.item_type === 'post');
        const housingFavorites = favorites.filter(f => f.item_type === 'housing');
        const jobFavorites = favorites.filter(f => f.item_type === 'job');
        const marketplaceFavorites = favorites.filter(f => f.item_type === 'marketplace');
        const lostItemFavorites = favorites.filter(f => f.item_type === 'lost_item');

        let favoriteItemsWithData = [];

        // Get post data
        if (postFavorites.length > 0) {
          const postIds = postFavorites.map(f => f.item_id);
          const { data: posts } = await supabase
            .from("posts")
            .select("id, title, content, category")
            .in("id", postIds);

          const postItems = postFavorites.map(favorite => ({
            ...favorite,
            posts: posts?.find(post => post.id === favorite.item_id) || null,
            type: 'post' as const
          }));
          favoriteItemsWithData.push(...postItems);
        }

        // Get housing data
        if (housingFavorites.length > 0) {
          const housingIds = housingFavorites.map(f => f.item_id);
          const { data: housing } = await supabase
            .from("housing")
            .select("id, title, location, rent_price")
            .in("id", housingIds);

          const housingItems = housingFavorites.map(favorite => ({
            ...favorite,
            housing: housing?.find(house => house.id === favorite.item_id) || null,
            type: 'housing' as const
          }));
          favoriteItemsWithData.push(...housingItems);
        }

        // Get job data
        if (jobFavorites.length > 0) {
          const jobIds = jobFavorites.map(f => f.item_id);
          const { data: jobs } = await supabase
            .from("jobs")
            .select("id, title, company, job_type")
            .in("id", jobIds);

          const jobItems = jobFavorites.map(favorite => ({
            ...favorite,
            job: jobs?.find(job => job.id === favorite.item_id) || null,
            type: 'job' as const
          }));
          favoriteItemsWithData.push(...jobItems);
        }

        // Get marketplace data
        if (marketplaceFavorites.length > 0) {
          const marketplaceIds = marketplaceFavorites.map(f => f.item_id);
          const { data: marketplace } = await supabase
            .from("marketplace")
            .select("id, title, price, category")
            .in("id", marketplaceIds);

          const marketplaceItems = marketplaceFavorites.map(favorite => ({
            ...favorite,
            marketplace: marketplace?.find(item => item.id === favorite.item_id) || null,
            type: 'marketplace' as const
          }));
          favoriteItemsWithData.push(...marketplaceItems);
        }

        // Get lost item data
        if (lostItemFavorites.length > 0) {
          const lostItemIds = lostItemFavorites.map(f => f.item_id);
          const { data: lostItems } = await supabase
            .from("lost_items")
            .select("id, title, item_type, location_lost")
            .in("id", lostItemIds);

          const lostItemItems = lostItemFavorites.map(favorite => ({
            ...favorite,
            lost_item: lostItems?.find(item => item.id === favorite.item_id) || null,
            type: 'lost_item' as const
          }));
          favoriteItemsWithData.push(...lostItemItems);
        }

        // Sort by created_at
        favoriteItemsWithData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setFavoriteItems(favoriteItemsWithData as any);
      } else {
        setFavoriteItems([]);
      }
    } catch (error) {
      console.error("Error fetching favorite items:", error);
      toast.error("Kaydedilen içerikler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    if (!user || !profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...updatedProfile });
      toast.success("Profil güncellendi");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profil güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;
      
      setPasswordData({ current: "", new: "", confirm: "" });
      toast.success("Şifre güncellendi");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Şifre güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlike = async (postId: string) => {
    await toggleLike(postId);
    await fetchLikedItems();
  };

  const handleRemoveFavorite = async (itemId: string, itemType: string) => {
    await toggleFavorite(itemId, itemType);
    await fetchFavoriteItems();
  };

  const fetchUserPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Paylaşımlarınız yüklenemedi");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      setUserPosts(prev => prev.filter(post => post.id !== postId));
      toast.success("Paylaşım silindi");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Paylaşım silinemedi");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <User className="w-8 h-8 mr-3" />
            Profil
          </h1>
          <p className="text-primary-foreground/90">
            Hesap bilgilerinizi yönetin ve aktivitelerinizi görüntüleyin
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-card border-border">
          <CardContent className="pt-6">
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Hesap Bilgilerim</TabsTrigger>
              <TabsTrigger value="posts">Paylaşımlarım</TabsTrigger>
              <TabsTrigger value="activity">Beğendiklerim & Kaydettiklerim</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <div className="grid gap-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email || ""}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullName">Ad Soyad</Label>
                        <Input
                          id="fullName"
                          value={profile?.full_name || ""}
                          onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                          placeholder="Ad ve soyadınızı girin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Bölüm</Label>
                        <Input
                          id="department"
                          value={profile?.department || ""}
                          onChange={(e) => setProfile(prev => prev ? {...prev, department: e.target.value} : null)}
                          placeholder="Bölümünüzü girin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Sınıf</Label>
                        <Input
                          id="year"
                          type="number"
                          min="1"
                          max="5"
                          value={profile?.year || ""}
                          onChange={(e) => setProfile(prev => prev ? {...prev, year: parseInt(e.target.value)} : null)}
                          placeholder="Sınıfınızı girin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="studentNumber">Öğrenci Numarası</Label>
                        <Input
                          id="studentNumber"
                          value={profile?.student_number || ""}
                          onChange={(e) => setProfile(prev => prev ? {...prev, student_number: e.target.value} : null)}
                          placeholder="Öğrenci numaranızı girin"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Hakkında</Label>
                      <Textarea
                        id="bio"
                        value={profile?.bio || ""}
                        onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                        placeholder="Kendiniz hakkında kısa bir açıklama yazın"
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={() => updateProfile({
                        full_name: profile?.full_name,
                        department: profile?.department,
                        year: profile?.year,
                        student_number: profile?.student_number,
                        bio: profile?.bio
                      })}
                      disabled={saving}
                    >
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Profili Güncelle
                    </Button>
                  </CardContent>
                </Card>

                {/* Password Change */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Şifre Değiştir</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">Yeni Şifre</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.new}
                        onChange={(e) => setPasswordData(prev => ({...prev, new: e.target.value}))}
                        placeholder="Yeni şifrenizi girin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData(prev => ({...prev, confirm: e.target.value}))}
                        placeholder="Yeni şifrenizi tekrar girin"
                      />
                    </div>
                    <Button
                      onClick={changePassword}
                      disabled={saving || !passwordData.new || !passwordData.confirm}
                    >
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Şifreyi Değiştir
                    </Button>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Görünüm Ayarları
                    </CardTitle>
                    <CardDescription>
                      Paylaşımlarınızda nasıl görüneceğinizi ayarlayın
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nameDisplay">İsim Görünümü</Label>
                        <Select
                          value={profile?.name_display_style || 'full'}
                          onValueChange={(value: 'full' | 'abbreviated') => 
                            setProfile(prev => prev ? {...prev, name_display_style: value} : null)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="İsim görünüm şeklini seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Tam İsim (Örn: İsim Soyisim)</SelectItem>
                            <SelectItem value="abbreviated">Kısaltılmış (Örn: İsim S.)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emailVisibility">E-posta Görünürlüğü</Label>
                        <Select
                          value={profile?.email_visibility ? 'visible' : 'hidden'}
                          onValueChange={(value) => 
                            setProfile(prev => prev ? {...prev, email_visibility: value === 'visible'} : null)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="E-posta görünürlüğünü seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visible">Görünür</SelectItem>
                            <SelectItem value="hidden">Gizli</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="avatarUpload">Profil Fotoğrafı</Label>
                      <div className="flex items-center gap-4">
                        {profile?.avatar_url && (
                          <img
                            src={profile.avatar_url}
                            alt="Profil fotoğrafı"
                            className="w-16 h-16 rounded-full object-cover border"
                          />
                        )}
                        <div className="flex-1">
                          <Input
                            id="avatarUpload"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && user) {
                                const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
                                const { error } = await supabase.storage
                                  .from('post-images')
                                  .upload(fileName, file);
                                
                                if (error) {
                                  toast.error('Fotoğraf yüklenemedi');
                                  return;
                                }
                                
                                const { data: { publicUrl } } = supabase.storage
                                  .from('post-images')
                                  .getPublicUrl(fileName);
                                  
                                setProfile(prev => prev ? {...prev, avatar_url: publicUrl} : null);
                                toast.success('Fotoğraf yüklendi');
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => updateProfile({
                        name_display_style: profile?.name_display_style,
                        email_visibility: profile?.email_visibility,
                        avatar_url: profile?.avatar_url
                      })}
                      disabled={saving}
                    >
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Görünüm Ayarlarını Güncelle
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Paylaşımlarım</h3>
              </div>
              {userPosts.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Henüz hiç paylaşım yapmadınız.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {userPosts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{post.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {post.category} • {new Date(post.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-2 line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {post.likes_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.comments_count}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Düzenle
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {/* Beğendiklerim Bölümü */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-destructive" />
                  <h3 className="text-lg font-semibold">Beğendiklerim</h3>
                </div>
                {likedItems.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-6">
                      <p className="text-muted-foreground">Henüz hiç içerik beğenmediniz.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {likedItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.posts?.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.posts?.category} • {new Date(item.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-sm mt-2 line-clamp-2">{item.posts?.content}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnlike(item.post_id)}
                              className="ml-4"
                            >
                              <Heart className="h-4 w-4 mr-1 fill-current text-destructive" />
                              Beğenmekten Vazgeç
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Kaydettiklerim Bölümü */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bookmark className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Kaydettiklerim</h3>
                </div>
                 {favoriteItems.length === 0 ? (
                   <Card>
                     <CardContent className="flex items-center justify-center py-6">
                       <p className="text-muted-foreground">Henüz hiç içerik kaydetmediniz.</p>
                     </CardContent>
                   </Card>
                 ) : (
                   <div className="space-y-3">
                     {favoriteItems.map((item: any) => (
                          <Card key={item.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">
                                      {item.item_type === 'post' ? 'Paylaşım' : 
                                       item.item_type === 'housing' ? 'Ev İlanı' :
                                       item.item_type === 'job' ? 'İş İlanı' :
                                       item.item_type === 'marketplace' ? 'Eşya Satışı' :
                                       item.item_type === 'lost_item' ? 'Kayıp Eşya' : 'Diğer'}
                                    </Badge>
                                  </div>
                                  
                                  {item.posts && (
                                    <>
                                      <h4 className="font-semibold">{item.posts.title}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {item.posts.category} • {new Date(item.created_at).toLocaleDateString()}
                                      </p>
                                      <p className="text-sm mt-2 line-clamp-2">{item.posts.content}</p>
                                    </>
                                  )}
                                  
                                  {item.housing && (
                                    <>
                                      <h4 className="font-semibold">{item.housing.title}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {item.housing.location} - ₺{item.housing.rent_price?.toLocaleString()} • {new Date(item.created_at).toLocaleDateString()}
                                      </p>
                                    </>
                                  )}
                                  
                                  {item.job && (
                                    <>
                                      <h4 className="font-semibold">{item.job.title}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {item.job.company} - {item.job.job_type} • {new Date(item.created_at).toLocaleDateString()}
                                      </p>
                                    </>
                                  )}
                                  
                                  {item.marketplace && (
                                    <>
                                      <h4 className="font-semibold">{item.marketplace.title}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        ₺{item.marketplace.price?.toLocaleString()} - {item.marketplace.category} • {new Date(item.created_at).toLocaleDateString()}
                                      </p>
                                    </>
                                  )}
                                  
                                  {item.lost_item && (
                                    <>
                                      <h4 className="font-semibold">{item.lost_item.title}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {item.lost_item.location_lost} - {item.lost_item.item_type === 'lost' ? 'Kayıp' : 'Bulundu'} • {new Date(item.created_at).toLocaleDateString()}
                                      </p>
                                    </>
                                  )}
                                  
                                  {!item.posts && !item.housing && !item.job && !item.marketplace && !item.lost_item && (
                                    <>
                                      <p className="font-medium">{item.item_type}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(item.created_at).toLocaleDateString()}
                                      </p>
                                    </>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveFavorite(item.item_id, item.item_type)}
                                  className="ml-4"
                                >
                                  <Bookmark className="h-4 w-4 mr-1 fill-current text-primary" />
                                  Kaydetmeyi Kaldır
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                     ))}
                   </div>
                 )}
              </div>
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}