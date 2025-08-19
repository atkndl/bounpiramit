import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, User, Heart, Bookmark, Edit, Trash2 } from "lucide-react";
import { useLikes } from "@/hooks/useLikes";
import { useFavorites } from "@/hooks/useFavorites";

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
}

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
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
      setProfile(data);
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
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFavoriteItems(data || []);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Profil
          </CardTitle>
          <CardDescription>
            Hesap bilgilerinizi yönetin ve aktivitelerinizi görüntüleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Hesap Bilgilerim</TabsTrigger>
              <TabsTrigger value="likes">Beğendiklerim</TabsTrigger>
              <TabsTrigger value="favorites">Kaydettiklerim</TabsTrigger>
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
              </div>
            </TabsContent>

            <TabsContent value="likes" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-semibold">Beğendiklerim</h3>
              </div>
              {likedItems.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
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
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Kaydettiklerim</h3>
              </div>
              {favoriteItems.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Henüz hiç içerik kaydetmediniz.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {favoriteItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.item_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveFavorite(item.item_id, item.item_type)}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}