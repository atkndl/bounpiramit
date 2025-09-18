import { Home, MessageSquare, Plus, User, Triangle } from "lucide-react";
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
  if (location.pathname === "/auth") return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Alt Navigasyon (YouTube benzeri boy/hiza + safe-area ile çakışmaz) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 rounded-t-2xl"
        style={{
          // Arka plan safe-area'yı kaplasın; içerik biraz daha yukarıda dursun
          paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)"
        }}
      >
        {/* İç çubuk: 56px yükseklik */}
        <nav className="relative h-14 px-3">
          {/* 5 öğe: Home, Piramit, Plus, Mesajlar, Profil (eşit kolonlar) */}
          <div className="grid grid-cols-5 h-full items-center">
            <NavLink to="/" className="flex flex-col items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}
              >
                <Home className="h-5 w-5" />
              </Button>
              <span className={`text-[11px] leading-4 ${isActive("/") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                Anasayfa
              </span>
            </NavLink>

            <NavLink to="/piramit" className="flex flex-col items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${isActive("/piramit") ? "text-primary" : "text-muted-foreground"}`}
              >
                <Triangle className="h-5 w-5" />
              </Button>
              <span className={`text-[11px] leading-4 ${isActive("/piramit") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                Piramit
              </span>
            </NavLink>

            <div className="flex flex-col items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="h-9 w-9 p-0 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                aria-label="İlan Ekle"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <span className="text-[11px] leading-4 text-muted-foreground">
                Ekle
              </span>
            </div>

            <NavLink to="/mesajlar" className="flex flex-col items-center justify-center relative">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${isActive("/mesajlar") ? "text-primary" : "text-muted-foreground"}`}
              >
                <MessageSquare className="h-5 w-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                  </span>
                )}
              </Button>
              <span className={`text-[11px] leading-4 ${isActive("/mesajlar") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                Mesajlar
              </span>
            </NavLink>

            <NavLink to="/profil" className="flex flex-col items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${isActive("/profil") ? "text-primary" : "text-muted-foreground"}`}
              >
                <User className="h-5 w-5" />
              </Button>
              <span className={`text-[11px] leading-4 ${isActive("/profil") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                Profil
              </span>
            </NavLink>
          </div>
        </nav>
      </div>

      <CreateListingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}