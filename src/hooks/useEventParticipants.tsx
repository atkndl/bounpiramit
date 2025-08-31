import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useEventParticipants() {
  const { user } = useAuth();
  const [participatedEvents, setParticipatedEvents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Check if user has joined an event
  const hasJoined = (eventId: string) => {
    return participatedEvents.has(eventId);
  };

  // Toggle event participation
  const toggleParticipation = async (eventId: string) => {
    if (!user) {
      toast.error('Etkinliğe katılmak için giriş yapmalısınız');
      return;
    }

    setLoading(true);
    try {
      const isParticipated = hasJoined(eventId);

      if (isParticipated) {
        // Leave event
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        const newParticipated = new Set(participatedEvents);
        newParticipated.delete(eventId);
        setParticipatedEvents(newParticipated);

        // Update event participant count
        const { error: updateError } = await supabase.rpc(
          'decrement_event_participants',
          { event_id: eventId }
        );

        if (updateError) {
          // Fallback to manual update
          const { data: event } = await supabase
            .from('events')
            .select('current_participants')
            .eq('id', eventId)
            .single();

          if (event) {
            await supabase
              .from('events')
              .update({ current_participants: Math.max(0, event.current_participants - 1) })
              .eq('id', eventId);
          }
        }

        toast.success('Etkinlikten ayrıldınız');
      } else {
        // Join event
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id
          });

        if (error) throw error;

        // Update local state
        const newParticipated = new Set(participatedEvents);
        newParticipated.add(eventId);
        setParticipatedEvents(newParticipated);

        // Update event participant count
        const { error: updateError } = await supabase.rpc(
          'increment_event_participants',
          { event_id: eventId }
        );

        if (updateError) {
          // Fallback to manual update
          const { data: event } = await supabase
            .from('events')
            .select('current_participants')
            .eq('id', eventId)
            .single();

          if (event) {
            await supabase
              .from('events')
              .update({ current_participants: event.current_participants + 1 })
              .eq('id', eventId);
          }
        }

        toast.success('Etkinliğe katıldınız!');
      }
    } catch (error) {
      console.error('Error toggling participation:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's participated events
  const fetchParticipatedEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const eventIds = new Set(data?.map(p => p.event_id) || []);
      setParticipatedEvents(eventIds);
    } catch (error) {
      console.error('Error fetching participated events:', error);
    }
  };

  useEffect(() => {
    fetchParticipatedEvents();
  }, [user]);

  return {
    hasJoined,
    toggleParticipation,
    loading,
    refetch: fetchParticipatedEvents
  };
}