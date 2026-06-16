import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full overflow-hidden">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile topbar — só visível em telas pequenas */}
          <header className="flex md:hidden items-center h-12 px-3 border-b bg-background shrink-0">
            <SidebarTrigger className="h-8 w-8" />
            <span className="ml-3 text-sm font-semibold text-primary">SAGzap myHonda</span>
          </header>

          <main className="flex-1 overflow-x-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
