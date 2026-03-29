import React from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  GitMerge, 
  CheckSquare, 
  Receipt, 
  PlusCircle, 
  History,
  LogOut,
  Menu,
  Building2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getNavItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case "admin":
        return [
          { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
          { title: "Users", url: "/admin/users", icon: Users },
          { title: "Workflows", url: "/admin/workflows", icon: GitMerge },
        ];
      case "manager":
        return [
          { title: "Pending Approvals", url: "/manager/approvals", icon: CheckSquare },
          { title: "Team Expenses", url: "/manager/team-expenses", icon: Receipt },
        ];
      case "employee":
        return [
          { title: "Submit Expense", url: "/employee/submit", icon: PlusCircle },
          { title: "My Expenses", url: "/employee/history", icon: History },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-border shadow-sm">
          <SidebarHeader className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Expensify</span>
          </SidebarHeader>
          <SidebarContent className="px-2 pt-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider mb-2 font-semibold">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.url || location.startsWith(item.url + '/')}
                        className="rounded-lg mb-1"
                      >
                        <Link href={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-10 w-10 border border-border shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-card shadow-sm z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="font-display text-xl font-semibold capitalize hidden sm:block text-foreground">
                {location.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background/50 p-4 md:p-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
