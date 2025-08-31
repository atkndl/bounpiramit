import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          is_read
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationMap = new Map<string, any>();
      
      for (const message of messages || []) {
        const partnerId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
        
        if (!conversationMap.has(partnerId)) {
          // Fetch partner profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', partnerId)
            .single();

          conversationMap.set(partnerId, {
            user_id: partnerId,
            user_name: profile?.full_name || 'Anonim',
            user_avatar: profile?.avatar_url || null,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0,
            messages: []
          });
        }

        const conversation = conversationMap.get(partnerId);
        conversation.messages.push(message);
        
        // Count unread messages
        if (message.recipient_id === user.id && !message.is_read) {
          conversation.unread_count++;
        }
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for specific conversation
  const fetchMessages = async (partnerId: string) => {
    if (!user) return;
    
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setCurrentMessages(messages || []);
      setActiveConversation(partnerId);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async (recipientId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        });

      if (error) throw error;

      // Refresh messages
      await fetchMessages(recipientId);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return {
    conversations,
    currentMessages,
    activeConversation,
    loading,
    fetchMessages,
    sendMessage,
    refetch: fetchConversations
  };
}