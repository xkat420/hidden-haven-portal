import { Home, Settings, User, Bell, Mail, Package, MessageSquare, ShoppingCart, Store } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useLanguage } from "@/context/LanguageContext"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const getMainItems = (t: (key: any) => string) => [
  { title: t('dashboard'), url: "/dashboard", icon: Home, color: "text-blue-500" },
  { title: t('messages'), url: "/messages", icon: MessageSquare, color: "text-green-500" },
  { title: "My Orders", url: "/my-orders", icon: Package, color: "text-purple-500" },
  { title: "Orders Status", url: "/orders", icon: Package, color: "text-indigo-500" },
  { title: t('userSettings'), url: "/user-settings", icon: Settings, color: "text-gray-500" },
];

const getManagementItems = (t: (key: any) => string) => [
  { title: t('shopManagement'), url: "/shop-management", icon: Store, color: "text-orange-500" },
  { title: t('orderManagement'), url: "/order-management", icon: ShoppingCart, color: "text-red-500" },
];

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const { user } = useAuth()
  const { t } = useLanguage()
  const collapsed = state === "collapsed"
  
  const mainItems = getMainItems(t);
  const managementItems = getManagementItems(t);

  const isActive = (path: string) => currentPath === path
  
  if (!user) return null

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} bg-sidebar backdrop-blur-md border-r border-sidebar-border`} collapsible="icon">
      <SidebarContent className="p-2">
        {/* App Header */}
        <div className={`transition-all duration-300 mb-6 ${collapsed ? "px-2" : "px-4"}`}>
          <div className={`${collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
            <h2 className="font-bold text-lg text-sidebar-foreground">
              Hidden Haven
            </h2>
            <p className="text-xs text-sidebar-foreground/60">Secure Platform</p>
          </div>
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary/10 flex items-center justify-center mx-auto">
              <Home className="w-4 h-4 text-sidebar-primary" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                        ${isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }
                      `}
                      title={collapsed ? item.title : undefined}
                    >
                      <div className={`p-2 rounded-lg ${isActive(item.url) ? 'bg-sidebar-primary-foreground/20' : 'bg-sidebar/50'}`}>
                        <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-sidebar-primary-foreground' : item.color}`} />
                      </div>
                      <span className={`transition-all duration-300 font-medium ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                        ${isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }
                      `}
                      title={collapsed ? item.title : undefined}
                    >
                      <div className={`p-2 rounded-lg ${isActive(item.url) ? 'bg-sidebar-primary-foreground/20' : 'bg-sidebar/50'}`}>
                        <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-sidebar-primary-foreground' : item.color}`} />
                      </div>
                      <span className={`transition-all duration-300 font-medium ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}