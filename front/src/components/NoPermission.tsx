import { ShieldOff, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const NoPermission = () => {
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: "Logout realizado com sucesso" });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4 text-center p-8">
      <ShieldOff className="h-16 w-16 text-muted-foreground opacity-30" />
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Acesso negado</h2>
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para acessar esta página.<br />
          Entre em contato com o administrador.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Sair
      </Button>
    </div>
  );
};
