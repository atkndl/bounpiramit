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
  const unreadMessagesCount = conversations.reduce((t, c) => t + c.unread_count, 0);
  const { unreadCount } = useNotifications();

  if (!isMobile) return null;
  if (location.pathname === "/auth") return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Alt Navigasyon */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 rounded-t-2xl"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
      >
        {/* İç çubuk: ~56px */}
        <nav className="relative h-14 px-3">
          {/* Orta '+' butonu */}
          <button
            aria-label="İlan Ekle"
            onClick={() => setShowCreateModal(true)}
            className="absolute left-1/2 -translate-x-1/2 -top-5 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-white/80 flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </button>

          {/* 5 kolon hissi: 4 item + ortada boş kolon (placeholder) */}
          <div className="grid grid-cols-5 h-full items-end pb-3">
            {/* 1) Anasayfa */}
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

            {/* 2) Piramit */}
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

            {/* 3) Ortadaki boş kolon (placeholder) — sadece hizalama için */}
            <div aria-hidden className="pointer-events-none" />

            {/* 4) Mesajlar */}
            <NavLink to="/mesajlar" className="flex flex-col items-center justify-center">
              {/* Rozeti sabitlemek için iconu relative bir sarmala aldık */}
              <div className="relative h-7 w-7 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${isActive("/mesajlar") ? "text-primary" : "text-muted-foreground"}`}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-2 -right-1 translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] leading-none rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] leading-4 ${isActive("/mesajlar") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                Mesajlar
              </span>
            </NavLink>

            {/* 5) Profil */}
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
