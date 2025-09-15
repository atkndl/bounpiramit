import { Home, MessageSquare, Plus, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { CreateListingModal } from "./CreateListingModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMessages } from "@/hooks/useMessages";
import { useNotifications } from "@/hooks/useNotifications";

export function MobileBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { conversations } = useMessages();
  const unreadMessagesCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const { unreadCount } = useNotifications();

  if (!isMobile) return null;
  
  // Hide bottom nav on auth pages
  if (location.pathname === '/auth') return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          <NavLink to="/" className="flex flex-col items-center space-y-1 min-w-0">
            <Button 
              variant="ghost" 
              size="sm"
              className={`h-8 w-8 p-0 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Home className="h-5 w-5" />
            </Button>
            <span className={`text-xs ${isActive('/') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Anasayfa
            </span>
          </NavLink>

          <NavLink to="/mesajlar" className="flex flex-col items-center space-y-1 min-w-0 relative">
            <Button 
              variant="ghost" 
              size="sm"
              className={`h-8 w-8 p-0 ${isActive('/mesajlar') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </span>
              )}
            </Button>
            <span className={`text-xs ${isActive('/mesajlar') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Mesajlar
            </span>
          </NavLink>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center space-y-1 min-w-0"
          >
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xs text-primary font-medium">
              İlan Ekle
            </span>
          </button>

          <button 
            onClick={() => window.location.href = '/bildirimler'}
            className="flex flex-col items-center space-y-1 min-w-0 relative"
          >
            <Button 
              variant="ghost" 
              size="sm"
              className={`h-8 w-8 p-0 ${isActive('/bildirimler') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
            <span className={`text-xs ${isActive('/bildirimler') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Bildirimler
            </span>
          </button>

          <NavLink to="/profil" className="flex flex-col items-center space-y-1 min-w-0">
            <Button 
              variant="ghost" 
              size="sm"
              className={`h-8 w-8 p-0 ${isActive('/profil') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <User className="h-5 w-5" />
            </Button>
            <span className={`text-xs ${isActive('/profil') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Profil
            </span>
          </NavLink>
        </div>
      </div>

      <CreateListingModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}