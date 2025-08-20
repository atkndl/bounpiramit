import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Calendar, Search, ShoppingBag, Building, Music, Trophy, Briefcase, User, Power } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Anasayfa", url: "/", icon: Home },
  { title: "Piramit", url: "/piramit", icon: MessageSquare },
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-6 border-b border-white/20">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-primary font-bold text-xl">P</span>
        </div>
        <div>
          <h2 className="font-semibold text-white text-lg">Boğaziçi Piramit</h2>
          <p className="text-xs text-white/70">Öğrenci Platformu</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-primary shadow-lg"
                  : "text-white hover:bg-white/10"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="ml-3 font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start hover:bg-white/10 px-4 py-3 rounded-lg text-red-200 hover:text-red-100"
        >
          <Power className="w-5 h-5" />
          <span className="ml-3 font-medium">Çıkış</span>
        </Button>
      </div>
    </div>
  );
}