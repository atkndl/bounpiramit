import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import pyramidLight from "@/assets/pyramid-light.png";

export function MobileHeader() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isMobile) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center space-x-2 flex-1">
          <div className="flex items-center space-x-2">
            <img 
              src={pyramidLight} 
              alt="Boğaziçi Piramit Logo" 
              className="w-8 h-8 object-contain"
              loading="lazy"
              decoding="async"
            />
            <span className="font-semibold text-primary text-lg">Boğaziçi Piramit</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {user ? (
            <NotificationBell />
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/auth')}
              className="flex items-center space-x-1"
            >
              <LogIn className="h-4 w-4" />
              <span className="text-sm">Giriş Yap</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}