import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useLikes() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast.error("Beğenmek için giriş yapmalısınız");
      return;
    }

    setIsLoading(true);
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);
        
        toast.success("Beğenmekten vazgeçildi");
      } else {
        // Like
        await supabase
          .from("likes")
          .insert({
            user_id: user.id,
            post_id: postId,
          });
        
        toast.success("Beğenildi!");
      }
      
      // Trigger refresh by returning success
      return { success: true };
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Bir hata oluştu");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const isLiked = async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  const getLikeCount = async (postId: string): Promise<number> => {
    try {
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "planned", head: true })
        .eq("post_id", postId);

      return count || 0;
    } catch {
      return 0;
    }
  };

  return {
    toggleLike,
    isLiked,
    getLikeCount,
    isLoading,
  };
}