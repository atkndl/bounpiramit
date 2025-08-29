import { NavLink, useLocation, Navigate } from "react-router-dom";
import { Home, MessageSquare, Calendar, Search, ShoppingBag, Building, Music, Trophy, Briefcase, User, Power } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import pyramidLight from "@/assets/pyramid-light.png";
const navigationItems = [{
  title: "Anasayfa",
  url: "/",
  icon: Home
}, {
  title: "Piramit",
  url: "/piramit",
  icon: MessageSquare
}, {
  title: "Kulüp Etkinlikleri",
  url: "/kulup-etkinlikleri",
  icon: Calendar
}, {
  title: "Kayıp Eşya",
  url: "/kayip-esya",
  icon: Search
}, {
  title: "Eşya Satış",
  url: "/satis",
  icon: ShoppingBag
}, {
  title: "Ev & Oda İlanları",
  url: "/ev-oda",
  icon: Building
}, {
  title: "Eğlence & Festival",
  url: "/eglence",
  icon: Music
}, {
  title: "Hobi & Spor",
  url: "/spor-hobi",
  icon: Trophy
}, {
  title: "Staj & İş İlanları",
  url: "/is-ilanlari",
  icon: Briefcase
}, {
  title: "Profil",
  url: "/profil",
  icon: User
}];
export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const {
    user,
    signOut,
    isLoading
  } = useAuth();

  // Redirect to auth if not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (isLoading) {
    return (
      <Sidebar className="w-64 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      </Sidebar>
    );
  }
  
  return (
    <Sidebar className="w-64 border-r border-gray-200 bg-white">
      <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
        <img 
          src={pyramidLight} 
          alt="Boğaziçi Piramit Logo" 
          className="w-8 h-8 object-contain"
          loading="lazy"
          decoding="async"
        />
        <span className="font-bold text-gray-800 text-lg">Boğaziçi Piramit</span>
      </div>

      <SidebarContent className="px-4 py-6 flex flex-col h-full">
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-blue-100 text-blue-800 shadow-sm" 
                            : "text-blue-800 hover:bg-gray-100"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="ml-3 font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Çıkış butonu alt kısımda */}
        <div className="pt-4 border-t border-gray-200">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Button 
                  onClick={signOut} 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-red-50 hover:text-red-600 px-4 py-3 rounded-lg text-red-600 transition-all duration-200"
                >
                  <Power className="w-5 h-5" />
                  <span className="ml-3 font-medium">Çıkış</span>
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}