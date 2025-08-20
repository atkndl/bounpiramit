import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface LostItem {
  id: string;
  title: string;
  description: string;
  location_lost: string | null;
  contact_info: string | null;
  item_type: "lost" | "found";
  image_urls?: string[] | null;
  created_at: string;
  user_id: string;
}

export function useLostItems() {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLostItems = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const apiPromise = supabase
        .from("lost_items")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await Promise.race([apiPromise, timeoutPromise]) as any;

      if (error) {
        console.error("Error fetching lost items:", error);
        setLostItems([]); // Ensure we set empty array on error
        toast.error("Kayıp eşyalar yüklenirken hata oluştu");
        return;
      }

      // Transform the data to match our interface
      const transformedData: LostItem[] = (data || []).map(item => ({
        ...item,
        item_type: item.item_type as "lost" | "found", // Type assertion
      }));

      setLostItems(transformedData);
    } catch (error) {
      console.error("Error in fetchLostItems:", error);
      setLostItems([]); // Ensure we set empty array on error
      toast.error("Beklenmeyen bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const createLostItem = async (itemData: {
    title: string;
    description: string;
    location_lost: string;
    contact_info: string;
    item_type: "lost" | "found";
    image_urls?: string[];
  }) => {
    if (!user) {
      toast.error("İlan oluşturmak için giriş yapmalısınız");
      return false;
    }

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const apiPromise = supabase
        .from("lost_items")
        .insert({
          ...itemData,
          user_id: user.id,
        });

      const { error } = await Promise.race([apiPromise, timeoutPromise]) as any;

      if (error) {
        console.error("Error creating lost item:", error);
        toast.error("İlan oluşturulurken hata oluştu");
        return false;
      }

      toast.success("İlan başarıyla oluşturuldu!");
      await fetchLostItems(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Error in createLostItem:", error);
      toast.error("Beklenmeyen bir hata oluştu");
      return false;
    }
  };

  const getStatistics = () => {
    const lost = lostItems.filter(item => item.item_type === "lost").length;
    const found = lostItems.filter(item => item.item_type === "found").length;
    const locations = new Set(lostItems.map(item => item.location_lost).filter(Boolean)).size;
    
    // Calculate items from this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = lostItems.filter(item => 
      new Date(item.created_at) > oneWeekAgo
    ).length;

    return { lost, found, locations, thisWeek };
  };

  useEffect(() => {
    fetchLostItems();
  }, []);

  return {
    lostItems,
    loading,
    createLostItem,
    refetch: fetchLostItems,
    statistics: getStatistics(),
  };
}