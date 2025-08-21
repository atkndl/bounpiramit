import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  contact_info?: string;
  image_urls: string[];
  user_id: string;
  is_sold: boolean;
  created_at: string;
  updated_at: string;
}

export const useMarketplace = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("marketplace")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching marketplace items:", error);
      setItems([]);
      toast({
        title: "Hata",
        description: "İlanlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData: {
    title: string;
    description: string;
    category: string;
    condition: string;
    price: number;
    contact_info?: string;
    image_urls?: string[];
  }) => {
    if (!user) {
      toast({
        title: "Giriş yapmanız gerekiyor",
        description: "İlan oluşturmak için lütfen giriş yapın.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("marketplace")
        .insert({
          ...itemData,
          user_id: user.id,
          image_urls: itemData.image_urls || [],
        });

      if (error) throw error;

      toast({
        title: "İlan oluşturuldu!",
        description: "İlanınız başarıyla yayınlandı.",
      });

      await fetchItems(); // Refresh data
      return true;
    } catch (error) {
      console.error("Error creating marketplace item:", error);
      toast({
        title: "Hata",
        description: "İlan oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
      return false;
    }
  };

  const markAsSold = async (itemId: string) => {
    if (!user) {
      toast({
        title: "Hata",
        description: "Giriş yapmanız gerekiyor.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("marketplace")
        .update({ is_sold: true })
        .eq("id", itemId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state immediately for better UX
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, is_sold: true } : item
        )
      );

      toast({
        title: "İlan güncellendi",
        description: "İlanınız satıldı olarak işaretlendi.",
      });
    } catch (error) {
      console.error("Error marking item as sold:", error);
      toast({
        title: "Hata",
        description: "İlan güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    createItem,
    markAsSold,
    refreshItems: fetchItems,
  };
};