import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Calendar, Search, ShoppingBag, Building, Music, Trophy, Briefcase, User, Power, MessageCircle, Triangle, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import bounPiramitLogo from "@/assets/boun-piramit-logo.svg";

const navigationItems = [
  { title: "Anasayfa", url: "/", icon: Home },
  { title: "Piramit", url: "/piramit", icon: Triangle },
  { title: "Mesajlar", url: "/mesajlar", icon: MessageCircle },
  { title: "Rehber", url: "/rehber", icon: Users },
  { title: "Kulüp Etkinlikleri", url: "/kulup-etkinlikleri", icon: Calendar },
  { title: "Kayıp Eşya", url: "/kayip-esya", icon: Search },
  { title: "Eşya Satış", url: "/satis", icon: ShoppingBag },
  { title: "Ev & Oda İlanları", url: "/ev-oda", icon: Building },
  { title: "Eğlence & Festival", url: "/eglence", icon: Music },
  { title: "Hobi & Spor", url: "/spor-hobi", icon: Trophy },
  { title: "Staj & İş İlanları", url: "/is-ilanlari", icon: Briefcase },
  { title: "Profil", url: "/profil", icon: User }
];

interface MobileSidebarProps {
  onNavigate?: () => void;
}

export function MobileSidebar({ onNavigate }: MobileSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { conversations } = useMessages();
  
  // Calculate unread messages count
  const unreadMessagesCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-4 p-6 border-b border-white/20">
        <img 
          src={bounPiramitLogo} 
          alt="Boğaziçi Piramit Logo" 
          className="w-10 h-10 object-contain"
          loading="lazy"
          decoding="async"
        />
        <div>
          <h2 className="font-bold text-white text-lg">Boğaziçi Piramit</h2>
          <p className="text-sm text-white/80">Öğrenci Platformu</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <nav className="p-4 space-y-3">
            {navigationItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center px-4 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? "bg-white text-primary shadow-lg scale-105"
                      : "text-white hover:bg-white/15 hover:scale-102"
                  }`
                }
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${location.pathname === item.url ? "scale-110" : "group-hover:scale-105"}`} />
                  <span className="ml-4 font-medium flex-1">{item.title}</span>
                  {item.title === 'Mesajlar' && unreadMessagesCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium ml-auto bg-white text-primary"
                    >
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </Badge>
                  )}
                  {location.pathname === item.url && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}
                </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start hover:bg-red-500/20 hover:text-red-100 px-4 py-4 rounded-xl text-red-200 transition-all duration-200 hover:scale-102"
        >
          <Power className="w-5 h-5" />
          <span className="ml-4 font-medium">Çıkış</span>
        </Button>
      </div>
    </div>
  );
}