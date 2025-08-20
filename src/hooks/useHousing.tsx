import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface HousingItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  room_type: string;
  rent_price: number;
  contact_info: string;
  image_urls: string[] | null;
  available_from: string | null;
  is_rented: boolean;
  created_at: string;
  updated_at: string;
}

export const useHousing = () => {
  const [items, setItems] = useState<HousingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("housing")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching housing items:", error);
      toast.error("İlanlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData: {
    title: string;
    description: string;
    location: string;
    room_type: string;
    rent_price: number;
    contact_info: string;
    image_urls?: string[] | null;
    available_from?: string | null;
    images?: string[];
  }) => {
    if (!user) {
      toast.error("Giriş yapmanız gerekiyor.");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("housing")
        .insert([
          {
            ...itemData,
            user_id: user.id,
            image_urls: itemData.images || itemData.image_urls,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately for better UX
      setItems(prevItems => [data, ...prevItems]);

      toast.success("İlanınız başarıyla oluşturulmuştur.");

      return data;
    } catch (error) {
      console.error("Error creating housing item:", error);
      toast.error("İlan oluşturulamadı.");
      return null;
    }
  };

  const markAsRented = async (itemId: string) => {
    if (!user) {
      toast.error("Giriş yapmanız gerekiyor.");
      return;
    }

    try {
      const { error } = await supabase
        .from("housing")
        .update({ is_rented: true })
        .eq("id", itemId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state immediately for better UX
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, is_rented: true } : item
        )
      );

      toast.success("İlanınız kiralandı olarak işaretlendi.");
    } catch (error) {
      console.error("Error marking item as rented:", error);
      toast.error("İlan güncellenemedi.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    createItem,
    markAsRented,
    refetch: fetchItems,
  };
};