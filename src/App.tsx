import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Piramit from "./pages/Piramit";
import KayipEsya from "./pages/KayipEsya";
import EsyaSatis from "./pages/EsyaSatis";
import EvOda from "./pages/EvOda";
import EglenceFestival from "./pages/EglenceFestival";
import SporHobi from "./pages/SporHobi";
import StajIs from "./pages/StajIs";
import KulupEtkinlikleri from "./pages/KulupEtkinlikleri";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <main className="flex-1 overflow-hidden">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/piramit" element={<Piramit />} />
                <Route path="/kayip-esya" element={<KayipEsya />} />
                <Route path="/satis" element={<EsyaSatis />} />
                <Route path="/ev-oda" element={<EvOda />} />
                <Route path="/eglence" element={<EglenceFestival />} />
                <Route path="/spor-hobi" element={<SporHobi />} />
                <Route path="/is-ilanlari" element={<StajIs />} />
                <Route path="/kulup-etkinlikleri" element={<KulupEtkinlikleri />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
