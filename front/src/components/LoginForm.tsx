
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, User } from "lucide-react";
import logoMyHonda from "@/assets/logo-myhonda.png";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha usuário e senha.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ email, password });

      if (result !== true) {
        toast({
          title: "Erro ao entrar",
          description: typeof result === 'string' ? result : "Verifique e-mail e senha e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erro de conexão",
        description: err?.message || "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo — branding ────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#1a0000] relative overflow-hidden p-12">

        {/* Gradiente de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000] via-[#8b0000] to-[#1a0000] opacity-80" />

        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px),
                              radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Círculos decorativos */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-48 -left-24 w-[32rem] h-[32rem] rounded-full bg-white/5" />

        {/* Conteúdo */}
        <div className="relative z-10">
          <img
            src={logoMyHonda}
            alt="SAGzap myHonda"
            className="h-14 w-auto object-contain brightness-0 invert opacity-90"
          />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-white leading-none tracking-tight">
              SAGzap
              <span className="block text-white/70">myHonda</span>
            </h1>
            <div className="w-16 h-1 bg-white/50 rounded-full" />
          </div>
          <p className="text-white/80 text-lg leading-relaxed max-w-xs">
            Acompanhe seus indicadores de forma simples, rápida e centralizada.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 text-sm">
            Sistema de Gestão SAGzap myHonda
          </p>
        </div>
      </div>

      {/* ── Painel direito — formulário ───────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">

        {/* Logo mobile */}
        <div className="lg:hidden mb-8">
          <img
            src={logoMyHonda}
            alt="SAGzap myHonda"
            className="h-12 w-auto mx-auto"
          />
        </div>

        <div className="w-full max-w-sm space-y-8">

          {/* Cabeçalho */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Bem-vindo</h2>
            <p className="text-sm text-gray-500">
              Faça login para acessar o SAGzap myHonda
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="pl-10 h-11 bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="pl-10 h-11 bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Rodapé */}
          <p className="text-center text-xs text-gray-400">
            SAGzap myHonda — Sistema de Gestão
          </p>
        </div>
      </div>
    </div>
  );
};
