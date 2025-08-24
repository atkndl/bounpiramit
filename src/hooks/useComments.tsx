import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  } | null;
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchComments = async () => {
    if (!postId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles separately to avoid relation issues
      const userIds = data?.map(comment => comment.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, email")
        .in("user_id", userIds);

      // Merge the data
      const commentsWithProfiles = data?.map(comment => ({
        ...comment,
        profiles: profiles?.find(p => p.user_id === comment.user_id) || null
      })) || [];

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Yorumlar yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          content: content.trim(),
          user_id: user.id,
          post_id: postId,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Fetch profile data for the new comment
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, email")
        .eq("user_id", user.id)
        .single();

      const commentWithProfile = {
        ...data,
        profiles: profile
      };

      setComments(prev => [...prev, commentWithProfile]);
      
      // Update post comment count
      await supabase
        .from("posts")
        .update({ comments_count: comments.length + 1 })
        .eq("id", postId);

      toast.success("Yorum eklendi!");
      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Yorum eklenirken hata oluştu");
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Update post comment count
      await supabase
        .from("posts")
        .update({ comments_count: Math.max(0, comments.length - 1) })
        .eq("id", postId);

      toast.success("Yorum silindi");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Yorum silinirken hata oluştu");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
}