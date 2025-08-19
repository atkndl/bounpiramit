import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Calendar,
  Search,
  ShoppingBag,
  Building,
  Music,
  Trophy,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Anasayfa", url: "/", icon: Home },
  { title: "Piramit", url: "/piramit", icon: MessageSquare },
  { title: "Kulüp Etkinlikleri", url: "/kulup-etkinlikleri", icon: Calendar },
  { title: "Kayıp Eşya", url: "/kayip-esya", icon: Search },
  { title: "Eşya Satış", url: "/satis", icon: ShoppingBag },
  { title: "Ev & Oda İlanları", url: "/ev-oda", icon: Building },
  { title: "Eğlence & Festival", url: "/eglence", icon: Music },
  { title: "Spor & Hobi", url: "/spor-hobi", icon: Trophy },
  { title: "Staj & İş İlanları", url: "/is-ilanlari", icon: Briefcase },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-gradient-to-b from-primary to-primary-light`}
      collapsible="icon"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">P</span>
            </div>
            <span className="text-white font-semibold">Boğaziçi Piramit</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md text-white hover:bg-white/10 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-white text-primary shadow-lg"
                            : "text-white hover:bg-white/10"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span className="ml-3 font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}