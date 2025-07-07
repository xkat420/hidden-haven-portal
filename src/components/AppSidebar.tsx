import { Home, Settings, User, Bell, Mail, Globe, Package } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useLanguage } from "@/context/LanguageContext"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const getMainItems = (t: (key: any) => string) => [
  { title: t('dashboard'), url: "/dashboard", icon: Home },
  { title: t('messages'), url: "/messages", icon: Mail },
  { title: t('userSettings'), url: "/user-settings", icon: User },
];

const getManagementItems = (t: (key: any) => string) => [
  { title: t('shopManagement'), url: "/shop-management", icon: Package },
  { title: t('orderManagement'), url: "/order-management", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const { user } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const collapsed = state === "collapsed"
  
  const mainItems = getMainItems(t);
  const managementItems = getManagementItems(t);

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive 
        ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-sm" 
        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground hover:border-primary/20 border border-transparent"
    }`

  if (!user) return null

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-60"} bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md border-primary/20 shadow-lg`} collapsible="icon">
      <SidebarContent className="p-4 bg-transparent">
        <div className="flex items-center justify-between mb-8 p-2">
          <div className={`transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            <h2 className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              Hidden Haven
            </h2>
            <p className="text-xs text-muted-foreground">Secure Shopping Platform</p>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={`transition-all duration-300 px-3 py-2 text-xs font-semibold text-primary/80 ${collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
            {t('dashboard')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => `${getNavCls({ isActive })} transition-all duration-200 hover:bg-muted/80`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 min-w-5 flex-shrink-0" />
                      <span className={`transition-all duration-300 font-medium ${collapsed ? "opacity-0 w-0 overflow-hidden ml-0" : "opacity-100 ml-0"}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className={`transition-all duration-300 px-3 py-2 text-xs font-semibold text-primary/80 ${collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => `${getNavCls({ isActive })} transition-all duration-200 hover:bg-muted/80`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 min-w-5 flex-shrink-0" />
                      <span className={`transition-all duration-300 font-medium ${collapsed ? "opacity-0 w-0 overflow-hidden ml-0" : "opacity-100 ml-0"}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Language Selector */}
        <div className={`mt-auto mb-4 ${collapsed ? "px-2" : "px-4"}`}>
          <div className={`transition-all duration-300 ${collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
            <label className="text-xs font-semibold text-primary/80 mb-2 block">
              {t('language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full p-2 rounded-md bg-background/50 border border-primary/20 text-sm focus:border-primary focus:outline-none"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="nl">Nederlands</option>
            </select>
          </div>
          {collapsed && (
            <Globe 
              className="w-4 h-4 text-muted-foreground mx-auto cursor-pointer hover:text-primary transition-colors" 
            />
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}