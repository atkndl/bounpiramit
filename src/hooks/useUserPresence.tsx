import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPresence {
  user_id: string;
  online_at: string;
}

export const useUserPresence = (targetUserId?: string) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    // Create a channel for user presence
    const presenceChannel = supabase.channel('user_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence state changes
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState<UserPresence>();
        const users = new Set<string>();
        
        // Extract all online user IDs from presence state
        Object.keys(state).forEach(userId => {
          if (state[userId] && state[userId].length > 0) {
            users.add(userId);
          }
        });
        
        setOnlineUsers(users);
        console.log('Presence sync:', users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers(prev => new Set([...prev, key]));
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          const presenceTrackStatus = await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
          console.log('Presence track status:', presenceTrackStatus);
        }
      });

    setChannel(presenceChannel);

    // Cleanup on unmount
    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [user]);

  // Function to check if a specific user is online
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  // Get online status for target user if specified
  const targetUserOnline = targetUserId ? isUserOnline(targetUserId) : false;

  return {
    onlineUsers,
    isUserOnline,
    targetUserOnline,
    onlineCount: onlineUsers.size,
  };
};