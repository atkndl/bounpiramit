import { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showTime: boolean;
  formatTime: (timestamp: string) => string;
  onEdit: (messageId: string, newContent: string) => Promise<any>;
  onDelete: (messageId: string) => Promise<void>;
}

export function MessageItem({ message, isOwn, showTime, formatTime, onEdit, onDelete }: MessageItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if message can be edited/deleted (within 15 minutes)
  const canEditDelete = isOwn && (new Date().getTime() - new Date(message.created_at).getTime()) < 15 * 60 * 1000;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (canEditDelete) {
      setShowActions(!showActions);
    }
  };

  const handleLongPressStart = () => {
    if (canEditDelete) {
      const timer = setTimeout(() => {
        setShowActions(true);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      try {
        await onEdit(message.id, editContent.trim());
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to edit message:', error);
      }
    } else {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleDelete = async () => {
    try {
      await onDelete(message.id);
      setShowActions(false);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  return (
    <div>
      {showTime && (
        <div className="text-center mb-4">
          <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {formatTime(message.created_at)}
          </span>
        </div>
      )}
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`group max-w-[80%] sm:max-w-xs lg:max-w-md relative`}>
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer select-none ${
              isOwn
                ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground rounded-br-md hover:shadow-md'
                : 'bg-card text-card-foreground border border-border/50 rounded-bl-md hover:shadow-md'
            } ${canEditDelete ? 'hover:ring-2 hover:ring-primary/30' : ''}`}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            onMouseLeave={() => setShowActions(false)}
          >
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="text-sm bg-transparent border-none p-0 h-auto focus:ring-0 focus:border-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                />
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed break-words">{message.content}</p>
            )}
          </div>

          {/* Action buttons */}
          {showActions && canEditDelete && !isEditing && (
            <div className={`absolute top-0 ${isOwn ? '-left-20' : '-right-20'} flex gap-1 bg-background border rounded-lg p-1 shadow-lg z-10 animate-fade-in`}>
              <Button size="sm" variant="ghost" onClick={handleEdit} className="h-6 w-6 p-0">
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDelete} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className={`text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isOwn ? 'text-right' : 'text-left'
          }`}>
            {new Date(message.created_at).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            {message.updated_at !== message.created_at && (
              <span className="ml-1 text-xs opacity-60">(düzenlendi)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}