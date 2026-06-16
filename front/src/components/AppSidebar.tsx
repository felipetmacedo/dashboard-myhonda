import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BarChart2,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
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
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

const baseMenuItems = [
  {
    title: "Dashboard Principal",
    url: "/",
    icon: Home,
    description: "Visão Geral",
    adminOnly: false,
  },
  {
    title: "Leads MyHonda",
    url: "/reports/leads",
    icon: BarChart2,
    description: "Integração MyHonda",
    adminOnly: false,
  },
  {
    title: "Administração",
    url: "/admin",
    icon: ShieldCheck,
    description: "Usuários e Lojas",
    adminOnly: true,
  },
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout, user } = useAuth();
  const { toast } = useToast();

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const menuItems = baseMenuItems.filter(item => !item.adminOnly || user?.isAdmin);

  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header - esconde logo quando colapsado */}
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <div className="group-data-[collapsible=icon]:hidden flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" className="flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-primary">MyHonda SFS</h2>
              <p className="text-xs text-muted-foreground">SFS</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Fechar menu"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>
        <div className="group-data-[collapsible=icon]:flex hidden justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Abrir menu"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent className="px-2 py-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end
                      onClick={handleNavigation}
                      className="group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!p-0"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <div className="group-data-[collapsible=icon]:hidden flex flex-col">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                  {index < menuItems.length - 1 && (
                    <Separator className="my-1.5 -mx-4 w-[calc(100%+2rem)] group-data-[collapsible=icon]:hidden" />
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator />

      {/* Footer com usuário */}
      <SidebarFooter className="p-4">
        <div className="group-data-[collapsible=icon]:hidden space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name ?? user?.email}</p>
              <p className="text-xs text-muted-foreground">Usuário ativo</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="group-data-[collapsible=icon]:block hidden">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full p-2" title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
