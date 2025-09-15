import { 
  MessageSquare, 
  Search, 
  ShoppingBag, 
  Home, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Trophy 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

export function MobileHomeGrid() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isMobile) return null;

  const handleSectionClick = (path: string) => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate(path);
    }
  };

  const sections = [
    {
      title: "Piramit",
      description: "Sosyal paylaşımlar",
      icon: MessageSquare,
      path: "/piramit",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Kayıp Eşya",
      description: "Kayıp/bulunan eşyalar",
      icon: Search,
      path: "/kayip-esya",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Eşya Satış",
      description: "Alışveriş platformu",
      icon: ShoppingBag,
      path: "/satis",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Ev/Oda",
      description: "Konaklama ilanları",
      icon: Home,
      path: "/ev-oda",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Etkinlikler",
      description: "Kulüp etkinlikleri",
      icon: Calendar,
      path: "/kulup-etkinlikleri",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Eğlence",
      description: "Festival & sosyal",
      icon: MapPin,
      path: "/eglence",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "Staj/İş",
      description: "İş fırsatları",
      icon: Briefcase,
      path: "/is-ilanlari",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Spor/Hobi",
      description: "Aktivite arkadaşı",
      icon: Trophy,
      path: "/spor-hobi",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Kategoriler</h2>
      <div className="grid grid-cols-3 gap-3">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card 
              key={section.path}
              className="p-4 flex flex-col items-center space-y-2 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSectionClick(section.path)}
            >
              <div className={`p-3 rounded-full ${section.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${section.color}`} />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">{section.title}</div>
                <div className="text-xs text-muted-foreground">{section.description}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}