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
  "Futbol": "/placeholder.svg",
  "Basketbol": "/placeholder.svg", 
  "Tenis": "/placeholder.svg",
  "Yüzme": "/placeholder.svg",
  "Yoga": "/placeholder.svg",
  "Fitness": "/placeholder.svg",
  "OKEY101": "/placeholder.svg",
  "Tavla": "/placeholder.svg",
  "Satranç": "/placeholder.svg",
  "Kutu Oyunu": "/placeholder.svg",
  "Fotoğrafçılık": "/placeholder.svg",
  "Müzik": "/placeholder.svg",
  "Sanat": "/placeholder.svg",
  "Teknoloji": "/placeholder.svg",
  "other": "/placeholder.svg"
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