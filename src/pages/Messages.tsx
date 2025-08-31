import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useDisplayName } from '@/hooks/useDisplayName';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Messages = () => {
  const { user } = useAuth();
  const { conversations, currentMessages, activeConversation, loading, fetchMessages, sendMessage } = useMessages();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!activeConversation || !newMessage.trim()) return;
    
    await sendMessage(activeConversation, newMessage);
    setNewMessage('');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Mesajlar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Mesajlar
          </h2>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Henüz mesaj yok</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Card 
                  key={conversation.user_id}
                  className={`mb-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                    activeConversation === conversation.user_id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => fetchMessages(conversation.user_id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.user_avatar || undefined} />
                        <AvatarFallback>
                          {conversation.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">
                            {conversation.user_name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.last_message_time)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                        {conversation.unread_count > 0 && (
                          <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center mt-1">
                            {conversation.unread_count}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                {(() => {
                  const conversation = conversations.find(c => c.user_id === activeConversation);
                  return (
                    <>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={conversation?.user_avatar || undefined} />
                        <AvatarFallback>
                          {conversation?.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold">
                        {conversation?.user_name || 'Anonim'}
                      </h3>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/20">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Mesajlar</h3>
              <p>Bir sohbet seçin veya yeni bir mesaj başlatın</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;