import { Home, Settings, User, Bell, Mail } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

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

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Messages", url: "/messages", icon: Mail },
  { title: "User Settings", url: "/user-settings", icon: User },
]

const managementItems = [
  { title: "Shop Management", url: "/shop-management", icon: Settings },
  { title: "Order Management", url: "/order-management", icon: Bell },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const { user } = useAuth()
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
      isActive 
        ? "bg-primary text-primary-foreground font-medium" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`

  if (!user) return null

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent className="p-2">
        <div className="flex items-center justify-between mb-6 p-2">
          <h2 className={`font-bold text-lg transition-opacity duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            Hidden Haven
          </h2>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={`transition-opacity duration-200 px-2 ${collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
            Main
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
                      <item.icon className="h-4 w-4 min-w-4 flex-shrink-0" />
                      <span className={`transition-all duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden ml-0" : "opacity-100 ml-2"}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={`transition-opacity duration-200 px-2 ${collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
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
                      <item.icon className="h-4 w-4 min-w-4 flex-shrink-0" />
                      <span className={`transition-all duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden ml-0" : "opacity-100 ml-2"}`}>
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