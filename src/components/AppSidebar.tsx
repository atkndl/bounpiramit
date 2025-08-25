import { useState } from "react";
import { NavLink, useLocation, Navigate } from "react-router-dom";
import { Home, MessageSquare, Calendar, Search, ShoppingBag, Building, Music, Trophy, Briefcase, ChevronLeft, ChevronRight, LogOut, User, Power } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import pyramidLight from "@/assets/pyramid-light.png";
import pyramidDark from "@/assets/pyramid-dark.png";
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
  const {
    state,
    toggleSidebar
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const {
    user,
    signOut,
    isLoading
  } = useAuth();
  const isCollapsed = state === "collapsed";

  // Redirect to auth if not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/auth" replace />;
  }
  if (isLoading) {
    return <Sidebar className="w-64 bg-gradient-to-b from-primary to-primary-light">
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Yükleniyor...</div>
        </div>
      </Sidebar>;
  }
  return <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 border-r-2 border-sidebar-border bg-sidebar-background shadow-lg`} collapsible="icon">
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && <div className="flex items-center space-x-3">
            <img 
              src={pyramidLight} 
              alt="Boğaziçi Piramit Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-sidebar-foreground text-lg">Boğaziçi Piramit</span>
          </div>}
        {isCollapsed && <img 
          src={pyramidLight} 
          alt="Boğaziçi Piramit Logo" 
          className="w-8 h-8 object-contain mx-auto"
        />}
        <button onClick={toggleSidebar} className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 hover:scale-105">
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <SidebarContent className="px-3 py-6 flex flex-col h-full">
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({
                  isActive
                }) => `flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive 
                  ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-elegant transform scale-105" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-102 hover:shadow-card"
                }`}>
                      <item.icon className={`w-5 h-5 transition-transform duration-200 ${currentPath === item.url ? "scale-110" : "group-hover:scale-105"}`} />
                      {!isCollapsed && <span className="ml-4 font-medium transition-all duration-200">{item.title}</span>}
                      {currentPath === item.url && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Çıkış butonu alt kısımda */}
        <div className="pt-4 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Button 
                  onClick={signOut} 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-destructive/10 hover:text-destructive px-4 py-3 rounded-xl text-sidebar-foreground transition-all duration-200 hover:scale-102"
                >
                  <Power className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-4 font-medium">Çıkış</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>;
}