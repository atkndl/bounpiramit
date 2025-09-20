import { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Check if message can be edited/deleted (within 15 minutes)
  const canEditDelete = isOwn && (new Date().getTime() - new Date(message.created_at).getTime()) < 15 * 60 * 1000;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle click outside to close actions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  // Handle mouse enter/leave for hover effect
  const handleMouseEnter = () => {
    if (canEditDelete && !isEditing) {
      setShowActions(true);
    }
  };

  const handleMouseLeave = () => {
    if (canEditDelete && !isEditing && !showDeleteDialog) {
      setShowActions(false);
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

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    setShowActions(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete(message.id);
      setShowDeleteDialog(false);
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
        <div 
          className={`group max-w-[80%] sm:max-w-xs lg:max-w-md relative`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 select-none ${
              isOwn
                ? 'bg-primary/10 text-foreground border border-primary/20 rounded-br-md hover:bg-primary/15'
                : 'bg-muted/50 text-foreground border border-border/30 rounded-bl-md hover:bg-muted/70'
            } ${canEditDelete ? 'hover:ring-1 hover:ring-primary/20' : ''}`}
          >
            {isEditing ? (
              <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
                <Input
                  ref={inputRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="text-sm bg-background/50 border-border/50 focus:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleSaveEdit} className="h-8 w-8 p-0 bg-success/10 hover:bg-success/20 border-success/30">
                    <Check className="w-3 h-3 text-success" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 w-8 p-0 bg-muted hover:bg-muted/80">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed break-words">{message.content}</p>
            )}
          </div>

          {/* Action buttons */}
          {showActions && canEditDelete && !isEditing && (
            <div 
              ref={actionsRef}
              className={`absolute top-0 ${isOwn ? '-left-16' : '-right-16'} flex gap-1 bg-popover border border-border rounded-lg p-1 shadow-lg z-20 animate-fade-in`}
            >
              <Button size="sm" variant="ghost" onClick={handleEdit} className="h-8 w-8 p-0 hover:bg-primary/10">
                <Edit3 className="w-4 h-4 text-primary" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDeleteClick} className="h-8 w-8 p-0 hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 text-destructive" />
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Mesajı Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bu mesajı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0">İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}