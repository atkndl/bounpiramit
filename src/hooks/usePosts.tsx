import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  image_urls?: string[];
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
  } | null;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPosts = async (category?: string) => {
    setLoading(true);
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      let query = supabase
        .from("posts")
        .select(`
          *
        `)
        .order("created_at", { ascending: false });

      if (category && category !== 'all') {
        query = query.eq("category", category);
      }

      const { data: postsData, error: postsError } = await Promise.race([query, timeoutPromise]) as any;
      if (postsError) throw postsError;

      // Fetch profile data separately and merge
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map(post => post.user_id))];
        
        const profilePromise = supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds as string[]);

        const { data: profilesData, error: profilesError } = await Promise.race([profilePromise, timeoutPromise]) as any;

        if (profilesError) {
          console.warn("Error fetching profiles:", profilesError);
        }

        // Merge posts with profile data
        const postsWithProfiles = postsData.map(post => ({
          ...post,
          profiles: profilesData?.find(profile => profile.user_id === post.user_id) || null
        }));

        setPosts(postsWithProfiles as Post[]);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]); // Ensure we set empty array on error
      toast.error("Paylaşımlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularPosts = async (limit = 5) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const apiPromise = supabase
        .from("posts")
        .select("*")
        .order("likes_count", { ascending: false })
        .limit(limit);

      const { data: postsData, error: postsError } = await Promise.race([apiPromise, timeoutPromise]) as any;

      if (postsError) throw postsError;

      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map(post => post.user_id))];
        
        const profilePromise = supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds as string[]);

        const { data: profilesData, error: profilesError } = await Promise.race([profilePromise, timeoutPromise]) as any;

        if (profilesError) {
          console.warn("Error fetching profiles:", profilesError);
        }

        // Merge posts with profile data
        const postsWithProfiles = postsData.map(post => ({
          ...post,
          profiles: profilesData?.find(profile => profile.user_id === post.user_id) || null
        }));

        return postsWithProfiles as Post[];
      }

      return [];
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      return [];
    }
  };

  const createPost = async (content: string, images: string[] = []) => {
    if (!user) {
      toast.error("Paylaşım yapmak için giriş yapmalısınız");
      return;
    }

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      // Upload images if any
      const imageUrls = await Promise.all(
        images.map(async (imageFile, index) => {
          const fileName = `${user.id}/${Date.now()}_${index}.jpg`;
          
          // Convert blob URL to file
          const response = await fetch(imageFile);
          const blob = await response.blob();
          
          const uploadPromise = supabase.storage
            .from('post-images')
            .upload(fileName, blob);

          const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(fileName);
            
          return publicUrl;
        })
      );

      const insertPromise = supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
          content,
          category: "piramit",
          image_urls: imageUrls.length > 0 ? imageUrls : null,
        })
        .select("*")
        .single();

      const { data: postData, error: insertError } = await Promise.race([insertPromise, timeoutPromise]) as any;

      if (insertError) throw insertError;

      // Fetch user profile for the created post
      const profilePromise = supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("user_id", user.id)
        .single();

      const { data: profileData } = await Promise.race([profilePromise, timeoutPromise]) as any;

      // Merge post with profile data
      const postWithProfile = {
        ...postData,
        profiles: profileData
      };

      // Add to local state
      setPosts(prev => [postWithProfile as Post, ...prev]);
      
      toast.success("Paylaşım başarıyla oluşturuldu!");
      return postData;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Paylaşım oluşturulamadı");
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success("Paylaşım silindi");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Paylaşım silinemedi");
    }
  };

  return {
    posts,
    loading,
    fetchPosts,
    fetchPopularPosts,
    createPost,
    deletePost,
  };
}