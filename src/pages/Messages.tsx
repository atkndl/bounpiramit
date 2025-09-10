import { useState, useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useDisplayName } from '@/hooks/useDisplayName';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send, MessageCircle, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageItem } from '@/components/MessageItem';
import { useNotifications } from '@/hooks/useNotifications';

const Messages = () => {
  const { user } = useAuth();
  const { conversations, currentMessages, activeConversation, loading, fetchMessages, sendMessage, editMessage, deleteMessage, startConversation } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [searchParams] = useSearchParams();
  const [showConversationList, setShowConversationList] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { markMessagesFromUserAsRead } = useNotifications();
  
  // Auto-select conversation if userId provided in URL
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      startConversation(userId);
      if (isMobile) {
        setShowConversationList(false);
      }
    }
  }, [searchParams, startConversation, isMobile]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Show conversation list on mobile when no active conversation
  useEffect(() => {
    if (isMobile && !activeConversation) {
      setShowConversationList(true);
    }
  }, [isMobile, activeConversation]);

  const handleSendMessage = async () => {
    if (!activeConversation || !newMessage.trim() || isSending) return;
    
    const messageText = newMessage;
    setNewMessage(''); // Clear input immediately for better UX
    setIsSending(true);
    
    try {
      await sendMessage(activeConversation, messageText);
      
      // Focus back to input for Chrome compatibility
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    } catch (error) {
      // If sending fails, restore the message
      setNewMessage(messageText);
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleConversationSelect = (userId: string) => {
    fetchMessages(userId);
    // Mark all message notifications from this user as read
    markMessagesFromUserAsRead(userId);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
  };

  // Only show loading on initial load, not on message sends
  if (loading && conversations.length === 0 && currentMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-content-background">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
          <div className="text-muted-foreground">Mesajlar yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-content-background overflow-hidden">
      {/* Conversations List */}
      <div className={`${
        isMobile 
          ? showConversationList ? 'w-full' : 'hidden'
          : 'w-full md:w-1/3 lg:w-1/4'
      } border-r border-border bg-card flex flex-col h-full overflow-hidden`}>
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary-light/5 flex-shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
            <MessageCircle className="w-5 h-5" />
            Mesajlar
            {conversations.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {conversations.length}
              </span>
            )}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="font-medium mb-2">Henüz mesaj yok</h3>
                <p className="text-sm">Yeni bir sohbet başlatmak için birisiyle etkileşime geçin</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Card 
                  key={conversation.user_id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-card hover:scale-[1.02] ${
                    activeConversation === conversation.user_id 
                      ? 'bg-gradient-to-r from-primary/10 to-primary-light/10 border-primary/30 shadow-card' 
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => handleConversationSelect(conversation.user_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                          <AvatarImage src={conversation.user_avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {conversation.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-medium animate-pulse">
                            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm truncate text-foreground">
                            {conversation.user_name}
                          </h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(conversation.last_message_time)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate leading-relaxed">
                          {conversation.last_message || 'Yeni sohbet'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${
        isMobile 
          ? showConversationList ? 'hidden' : 'w-full'
          : 'flex-1'
      } flex flex-col bg-background h-full overflow-hidden`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-card to-card/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                    className="hover:bg-primary/10"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                {(() => {
                  const conversation = conversations.find(c => c.user_id === activeConversation);
                  return (
                    <>
                      <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                        <AvatarImage src={conversation?.user_avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {conversation?.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">
                          {conversation?.user_name || 'Anonim'}
                        </h3>
                        <p className="text-xs text-muted-foreground">Aktif</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Messages - Scrollable Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-content-background">
              <div className="p-4 space-y-4">
                {currentMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Henüz mesaj yok. İlk mesajı gönderin!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {currentMessages.map((message, index) => {
                      const isOwn = message.sender_id === user?.id;
                      const showTime = index === 0 || 
                        new Date(message.created_at).getTime() - new Date(currentMessages[index - 1].created_at).getTime() > 300000; // 5 minutes
                      
                      return (
                        <MessageItem
                          key={message.id}
                          message={message}
                          isOwn={isOwn}
                          showTime={showTime}
                          formatTime={formatTime}
                          onEdit={editMessage}
                          onDelete={deleteMessage}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Message Input - Fixed at Bottom */}
            <div className="p-4 border-t border-border bg-card/95 backdrop-blur-sm flex-shrink-0 sticky bottom-0">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <Input
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    disabled={isSending}
                    className="pr-12 rounded-full border-2 border-muted focus:border-primary/50 transition-all duration-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  size="icon"
                  disabled={!newMessage.trim() || isSending}
                  className="rounded-full bg-gradient-to-r from-primary to-primary-light hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isSending ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-b from-background to-content-background">
            <div className="text-center text-muted-foreground max-w-md px-4">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Mesajlaşmaya Başlayın</h3>
              <p className="text-muted-foreground leading-relaxed">
                {isMobile 
                  ? "Bir sohbet seçmek için listeye dönün"
                  : "Soldaki listeden bir sohbet seçin veya yeni bir mesaj başlatın"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;