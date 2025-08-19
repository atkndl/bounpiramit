import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useFavorites() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const toggleFavorite = async (itemId: string, itemType: string) => {
    if (!user) {
      toast.error("Kaydetmek için giriş yapmalısınız");
      return;
    }

    setIsLoading(true);
    try {
      // Check if already favorited
      const { data: existingFavorite } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_id", itemId)
        .eq("item_type", itemType)
        .single();

      if (existingFavorite) {
        // Remove from favorites
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", itemId)
          .eq("item_type", itemType);
      } else {
        // Add to favorites
        await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            item_id: itemId,
            item_type: itemType,
          });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorited = async (itemId: string, itemType: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_id", itemId)
        .eq("item_type", itemType)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  return {
    toggleFavorite,
    isFavorited,
    isLoading,
  };
}