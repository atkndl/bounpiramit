import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface SportsActivity {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string;
  activity_type: string;
  organizer: string | null;
  activity_date: string | null;
  activity_time: string | null;
  max_participants: number | null;
  current_participants: number;
  contact_info: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Stock images for each category
const categoryImages: Record<string, string> = {
  "Futbol": "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=300&fit=crop",
  "Basketbol": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop", 
  "Tenis": "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=400&h=300&fit=crop",
  "Yüzme": "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop",
  "Yoga": "https://images.unsplash.com/photo-1506126613408-eca07ce68e71?w=400&h=300&fit=crop",
  "Fitness": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
  "OKEY101": "https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=400&h=300&fit=crop",
  "Tavla": "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop",
  "Satranç": "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=400&h=300&fit=crop",
  "Kutu Oyunu": "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400&h=300&fit=crop",
  "Fotoğrafçılık": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
  "Müzik": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
  "Sanat": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
  "Teknoloji": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
  "other": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
};

export const useSportsActivities = () => {
  const [activities, setActivities] = useState<SportsActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("sports_activities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching sports activities:", error);
      setActivities([]);
      toast.error("Etkinlikler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: {
    title: string;
    description: string;
    location: string;
    category: string;
    activity_type: string;
    organizer?: string;
    activity_date?: string;
    activity_time?: string;
    max_participants?: number;
    contact_info?: string;
  }) => {
    if (!user) {
      toast.error("Giriş yapmanız gerekiyor.");
      return null;
    }

    try {
      const imageUrl = categoryImages[activityData.category] || categoryImages["other"];
      
      const { data, error } = await supabase
        .from("sports_activities")
        .insert([
          {
            ...activityData,
            user_id: user.id,
            image_url: imageUrl,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately for better UX
      setActivities(prevActivities => [data, ...prevActivities]);

      toast.success("Etkinlik başarıyla oluşturuldu.");

      return data;
    } catch (error) {
      console.error("Error creating sports activity:", error);
      toast.error("Etkinlik oluşturulamadı.");
      return null;
    }
  };

  const markAsInactive = async (activityId: string) => {
    if (!user) {
      toast.error("Giriş yapmanız gerekiyor.");
      return;
    }

    try {
      const { error } = await supabase
        .from("sports_activities")
        .update({ is_active: false })
        .eq("id", activityId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state immediately for better UX
      setActivities(prevActivities => 
        prevActivities.filter(activity => activity.id !== activityId)
      );

      toast.success("Etkinlik pasif hale getirildi.");
    } catch (error) {
      console.error("Error marking activity as inactive:", error);
      toast.error("Etkinlik güncellenemedi.");
    }
  };

  const joinActivity = async (activityId: string) => {
    if (!user) {
      toast.error("Giriş yapmanız gerekiyor.");
      return;
    }

    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) throw new Error('Activity not found');

      if (activity.max_participants && activity.current_participants >= activity.max_participants) {
        throw new Error('Etkinlik dolu');
      }

      const { data, error } = await supabase
        .from('sports_activities')
        .update({ current_participants: activity.current_participants + 1 })
        .eq('id', activityId)
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => prev.map(a => 
        a.id === activityId ? { ...a, current_participants: data.current_participants } : a
      ));

      toast.success("Etkinliğe katılım sağlandı!");
      return data;
    } catch (error) {
      console.error('Error joining activity:', error);
      toast.error(error instanceof Error ? error.message : "Etkinliğe katılırken bir hata oluştu.");
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    createActivity,
    markAsInactive,
    joinActivity,
    refetch: fetchActivities,
  };
};