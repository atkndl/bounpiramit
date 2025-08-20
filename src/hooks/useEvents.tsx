import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string;
  tags: string[] | null;
  max_participants: number | null;
  current_participants: number;
  event_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  image_urls?: string[] | null;
  organizer?: string;
  likes?: number;
  isLiked?: boolean;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const apiPromise = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      const { data, error } = await Promise.race([apiPromise, timeoutPromise]) as any;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Ensure we set empty array on error
      toast({
        title: "Hata",
        description: "Etkinlikler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create event
  const createEvent = async (eventData: {
    title: string;
    description: string;
    location: string;
    category: string;
    event_date: string;
    max_participants?: number;
    tags?: string[];
    image_urls?: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const apiPromise = supabase
        .from('events')
        .insert([
          {
            ...eventData,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      const { data, error } = await Promise.race([apiPromise, timeoutPromise]) as any;

      if (error) throw error;

      setEvents(prev => [data, ...prev]);
      toast({
        title: "Başarılı",
        description: "Etkinlik başarıyla oluşturuldu.",
      });

      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Hata",
        description: "Etkinlik oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update event
  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...data } : event
      ));

      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Hata",
        description: "Etkinlik güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast({
        title: "Başarılı",
        description: "Etkinlik başarıyla silindi.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Hata",
        description: "Etkinlik silinirken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Join event
  const joinEvent = async (id: string) => {
    try {
      const event = events.find(e => e.id === id);
      if (!event) throw new Error('Event not found');

      if (event.max_participants && event.current_participants >= event.max_participants) {
        throw new Error('Event is full');
      }

      const { data, error } = await supabase
        .from('events')
        .update({ current_participants: event.current_participants + 1 })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => prev.map(e => 
        e.id === id ? { ...e, current_participants: data.current_participants } : e
      ));

      toast({
        title: "Başarılı",
        description: "Etkinliğe katılım sağlandı!",
      });

      return data;
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Etkinliğe katılırken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Upload image to storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    uploadImage,
    refetch: fetchEvents,
  };
}