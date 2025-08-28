import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { requestManager } from "@/lib/requestManager";

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
    const requestKey = `posts-${category || 'all'}`;
    
    try {
      return await requestManager.execute(requestKey, async () => {
        setLoading(true);
        
        let query = supabase
          .from("posts")
          .select(`
            *
          `)
          .order("created_at", { ascending: false });

        if (category && category !== 'all') {
          query = query.eq("category", category);
        }

        const { data: postsData, error: postsError } = await query;
        if (postsError) throw postsError;

        // Fetch profile data separately and merge
        if (postsData && postsData.length > 0) {
          const userIds = [...new Set(postsData.map(post => post.user_id))];
          
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .in("user_id", userIds as string[]);

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
        
        setLoading(false);
        return posts;
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
      setLoading(false);
      
      if (error instanceof Error && error.message === 'Session not loaded yet') {
        return; // Don't show error for session loading
      }
      
      toast.error("Paylaşımlar yüklenemedi");
    }
  };

  const fetchPopularPosts = async (limit = 5) => {
    const requestKey = `popular-posts-${limit}`;
    
    try {
      return await requestManager.execute(requestKey, async () => {
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .order("likes_count", { ascending: false })
          .limit(limit);

        if (postsError) throw postsError;

        if (postsData && postsData.length > 0) {
          const userIds = [...new Set(postsData.map(post => post.user_id))];
          
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .in("user_id", userIds as string[]);

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
      });
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      
      if (error instanceof Error && error.message === 'Session not loaded yet') {
        return []; // Return empty array for session loading
      }
      
      return [];
    }
  };

  const createPost = async (content: string, images: string[] = []) => {
    const requestKey = `create-post-${Date.now()}`;
    
    try {
      return await requestManager.execute(requestKey, async () => {
        if (!user) {
          toast.error("Paylaşım yapmak için giriş yapmalısınız");
          return;
        }

        // Upload images if any
        const imageUrls = await Promise.all(
          images.map(async (imageFile, index) => {
            const fileName = `${user.id}/${Date.now()}_${index}.jpg`;
            
            // Convert blob URL to file
            const response = await fetch(imageFile);
            const blob = await response.blob();
            
            const { data, error } = await supabase.storage
              .from('post-images')
              .upload(fileName, blob);

            if (error) throw error;
            
            const { data: { publicUrl } } = supabase.storage
              .from('post-images')
              .getPublicUrl(fileName);
              
            return publicUrl;
          })
        );

        const { data: postData, error: insertError } = await supabase
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

        if (insertError) throw insertError;

        // Fetch user profile for the created post
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .eq("user_id", user.id)
          .single();

        // Merge post with profile data
        const postWithProfile = {
          ...postData,
          profiles: profileData
        };

        // Add to local state
        setPosts(prev => [postWithProfile as Post, ...prev]);
        
        toast.success("Paylaşım başarıyla oluşturuldu!");
        return postData;
      }, true); // Requires authentication
    } catch (error) {
      console.error("Error creating post:", error);
      
      if (error instanceof Error) {
        if (error.message === 'Authentication required') {
          toast.error("Paylaşım yapmak için giriş yapmalısınız");
          return;
        }
        if (error.message === 'Session not loaded yet') {
          toast.error("Lütfen bekleyin...");
          return;
        }
      }
      
      toast.error("Paylaşım oluşturulamadı");
    }
  };

  const deletePost = async (postId: string) => {
    const requestKey = `delete-post-${postId}`;
    
    try {
      return await requestManager.execute(requestKey, async () => {
        if (!user) return;

        const { error } = await supabase
          .from("posts")
          .delete()
          .eq("id", postId)
          .eq("user_id", user.id);

        if (error) throw error;

        setPosts(prev => prev.filter(post => post.id !== postId));
        toast.success("Paylaşım silindi");
      }, true); // Requires authentication
    } catch (error) {
      console.error("Error deleting post:", error);
      
      if (error instanceof Error) {
        if (error.message === 'Authentication required') {
          toast.error("Bu işlem için giriş yapmalısınız");
          return;
        }
        if (error.message === 'Session not loaded yet') {
          toast.error("Lütfen bekleyin...");
          return;
        }
      }
      
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