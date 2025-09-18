import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AuthProvider } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserPresence } from "@/hooks/useUserPresence";
import Index from "./pages/Index";
import Piramit from "./pages/Piramit";
import KayipEsya from "./pages/KayipEsya";
import EsyaSatis from "./pages/EsyaSatis";
import EvOda from "./pages/EvOda";
import EglenceFestival from "./pages/EglenceFestival";
import SporHobi from "./pages/SporHobi";
import StajIs from "./pages/StajIs";
import KulupEtkinlikleri from "./pages/KulupEtkinlikleri";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";


const AppContent = () => {
  const isMobile = useIsMobile();

  // Keep user presence tracking active globally across the app
  useUserPresence();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background">
        <MobileHeader />
        <div className="flex flex-1 w-full">
          {!isMobile && <AppSidebar />}
          <main className="flex-1 overflow-hidden bg-content-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/piramit" element={<Piramit />} />
              <Route path="/kayip-esya" element={<KayipEsya />} />
              <Route path="/satis" element={<EsyaSatis />} />
              <Route path="/ev-oda" element={<EvOda />} />
              <Route path="/eglence" element={<EglenceFestival />} />
              <Route path="/spor-hobi" element={<SporHobi />} />
              <Route path="/is-ilanlari" element={<StajIs />} />
              <Route path="/kulup-etkinlikleri" element={<KulupEtkinlikleri />} />
              <Route path="/mesajlar" element={<Messages />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/bildirimler" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);


export default App;
