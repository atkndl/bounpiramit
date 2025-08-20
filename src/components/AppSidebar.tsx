import { useState } from "react";
import { NavLink, useLocation, Navigate } from "react-router-dom";
import { Home, MessageSquare, Calendar, Search, ShoppingBag, Building, Music, Trophy, Briefcase, ChevronLeft, ChevronRight, LogOut, User, Power } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
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
  return <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-gradient-to-b from-primary to-primary-light`} collapsible="icon">
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {!isCollapsed && <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">P</span>
            </div>
            <span className="font-semibold text-blue-600">Boğaziçi Piramit</span>
          </div>}
        <button onClick={toggleSidebar} className="p-1 rounded-md text-white hover:bg-white/10 transition-colors">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <SidebarContent className="px-2 py-4 flex flex-col h-full">
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({
                  isActive
                }) => `flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-white text-primary shadow-lg" : "text-white hover:bg-white/10"}`}>
                      <item.icon className="w-5 h-5 my-0" />
                      {!isCollapsed && <span className="ml-3 font-medium my-0">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
              
              {/* Çıkış butonu */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button onClick={signOut} variant="ghost" className="w-full justify-start hover:bg-white/10 px-3 py-3 rounded-lg text-red-600">
                    <Power className="w-5 h-5" />
                    {!isCollapsed && <span className="ml-3 font-medium">Çıkış</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}