import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Favorite {
  id: string;
  item_id: string;
  item_type: string;
  created_at: string;
}

export function useFavorites() {
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (itemId: string, itemType: string) => {
    if (!user) {
      toast.error("Kaydetmek için giriş yapmalısınız");
      return;
    }

    setIsLoading(true);
    try {
      // Check if already favorited
      const existingFavorite = favorites.find(fav => fav.item_id === itemId && fav.item_type === itemType);

      if (existingFavorite) {
        // Remove from favorites
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", itemId)
          .eq("item_type", itemType);
        
        setFavorites(prev => prev.filter(fav => fav.id !== existingFavorite.id));
      } else {
        // Add to favorites
        const { data } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            item_id: itemId,
            item_type: itemType,
          })
          .select()
          .single();

        if (data) {
          setFavorites(prev => [data, ...prev]);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorited = async (itemId: string, itemType: string): Promise<boolean> => {
    return favorites.some(fav => fav.item_id === itemId && fav.item_type === itemType);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    toggleFavorite,
    isFavorited,
    isLoading,
  };
}