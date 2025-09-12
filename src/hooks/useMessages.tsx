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
    
    // Don't set loading if we already have conversations to prevent white screen
    if (conversations.length === 0) {
      setLoading(true);
    }
    
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
        
        // Only update if this message is more recent
        if (new Date(message.created_at) > new Date(conversation.last_message_time)) {
          conversation.last_message = message.content;
          conversation.last_message_time = message.created_at;
        }
        
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
      const { data: updatedMessages } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .select('id');

      // Update conversations unread count
      if (updatedMessages && updatedMessages.length > 0) {
        setConversations(prev => 
          prev.map(conv => 
            conv.user_id === partnerId 
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      }

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async (recipientId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Add message immediately to UI for better UX
      if (data && activeConversation === recipientId) {
        setCurrentMessages(prev => {
          if (prev.find(msg => msg.id === data.id)) {
            return prev;
          }
          return [...prev, data];
        });
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error; // Re-throw so UI can handle the error
    }
  };

  // Edit message
  const editMessage = async (messageId: string, newContent: string) => {
    if (!user || !newContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ content: newContent.trim() })
        .eq('id', messageId)
        .eq('sender_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setCurrentMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, content: newContent.trim() } : msg)
      );

      return data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      // Remove from local state immediately
      setCurrentMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  // Start new conversation with a user
  const startConversation = async (userId: string) => {
    if (!user) return;
    
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => conv.user_id === userId);
      if (existingConversation) {
        await fetchMessages(userId);
        return;
      }

      // Fetch user profile for new conversation
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', userId)
        .single();

      // Create a new conversation entry in the UI
      const newConversation: Conversation = {
        user_id: userId,
        user_name: profile?.full_name || 'Anonim',
        user_avatar: profile?.avatar_url || null,
        last_message: '',
        last_message_time: new Date().toISOString(),
        unread_count: 0
      };

      setConversations(prev => [newConversation, ...prev]);
      setCurrentMessages([]);
      setActiveConversation(userId);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        (payload) => {
          console.log('Message change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            
            // If this message is for the active conversation, add it to currentMessages
            if (activeConversation && 
                ((newMessage.sender_id === user.id && newMessage.recipient_id === activeConversation) ||
                 (newMessage.sender_id === activeConversation && newMessage.recipient_id === user.id))) {
              setCurrentMessages(prev => {
                // Prevent duplicates
                if (prev.find(msg => msg.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });
            }
            
            // Update conversations without full refetch
            setConversations(prev => {
              const updated = [...prev];
              const partnerId = newMessage.sender_id === user.id ? newMessage.recipient_id : newMessage.sender_id;
              const conversationIndex = updated.findIndex(c => c.user_id === partnerId);
              
              if (conversationIndex >= 0) {
                // Update existing conversation
                const currentUnreadCount = updated[conversationIndex].unread_count;
                const newUnreadCount = newMessage.sender_id !== user.id && newMessage.recipient_id === user.id 
                  ? currentUnreadCount + 1 
                  : currentUnreadCount;
                
                updated[conversationIndex] = {
                  ...updated[conversationIndex],
                  last_message: newMessage.content,
                  last_message_time: newMessage.created_at,
                  unread_count: newUnreadCount
                };
                // Move to top
                const [conversation] = updated.splice(conversationIndex, 1);
                updated.unshift(conversation);
                
                console.log(`Updated conversation with ${partnerId}: unread count ${newUnreadCount}`);
              } else {
                // New conversation - fetch partner profile and create conversation
                console.log(`Creating new conversation with ${partnerId}`);
                (async () => {
                  try {
                    const { data: profile } = await supabase
                      .from('profiles')
                      .select('full_name, avatar_url')
                      .eq('user_id', partnerId)
                      .single();

                    const newConversation = {
                      user_id: partnerId,
                      user_name: profile?.full_name || 'Anonim',
                      user_avatar: profile?.avatar_url || null,
                      last_message: newMessage.content,
                      last_message_time: newMessage.created_at,
                      unread_count: newMessage.sender_id !== user.id && newMessage.recipient_id === user.id ? 1 : 0
                    };

                    setConversations(prev => [newConversation, ...prev]);
                    console.log(`New conversation created with unread count: ${newConversation.unread_count}`);
                  } catch (error) {
                    console.error('Error creating new conversation:', error);
                    // Fallback to refetch
                    fetchConversations();
                  }
                })();
              }
              
              return updated;
            });
          }
          
          if (payload.eventType === 'UPDATE') {
            // Handle message read status updates
            const updatedMessage = payload.new as Message;
            const oldMessage = payload.old as Message;
            
            if (activeConversation && 
                ((updatedMessage.sender_id === user.id && updatedMessage.recipient_id === activeConversation) ||
                 (updatedMessage.sender_id === activeConversation && updatedMessage.recipient_id === user.id))) {
              setCurrentMessages(prev => 
                prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
              );
            }
            
            // Update unread count when message read status changes
            if (oldMessage && !oldMessage.is_read && updatedMessage.is_read && updatedMessage.recipient_id === user.id) {
              const partnerId = updatedMessage.sender_id;
              setConversations(prev => 
                prev.map(conv => {
                  if (conv.user_id === partnerId) {
                    const newUnreadCount = Math.max(0, conv.unread_count - 1);
                    console.log(`Message read: reducing unread count for ${partnerId} from ${conv.unread_count} to ${newUnreadCount}`);
                    return { ...conv, unread_count: newUnreadCount };
                  }
                  return conv;
                })
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConversation, fetchConversations]);

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
    editMessage,
    deleteMessage,
    startConversation,
    refetch: fetchConversations
  };
}