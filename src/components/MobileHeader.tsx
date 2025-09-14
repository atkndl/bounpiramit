import { useState } from "react";
import { Menu, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./MobileSidebar";
import { NotificationBell } from "./NotificationBell";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import pyramidLight from "@/assets/pyramid-light.png";
import pyramidDark from "@/assets/pyramid-dark.png";

export function MobileHeader() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!isMobile) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <div className="h-full bg-gradient-to-b from-primary to-primary-light">
              <MobileSidebar onNavigate={() => setIsOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        
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