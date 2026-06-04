
export interface LoginRequest {
  user: string;
  pass: string;
}

export interface Loja {
  codhda: string;
  empresa: string;
  token_whatsapp: string;
}

export interface LoginResponse {
  servico: string;
  retorno: boolean;
  message: string;
  lojas: Loja[];
}

export interface AuthUser {
  user: string;
  lojas: Loja[];
  isAuthenticated: boolean;
}

/** Verifica se o usuário é master (admin). Centraliza a lógica para evitar duplicação. */
export const checkIsMasterUser = (user: AuthUser | null): boolean => {
  if (!user) return false;
  const u = user.user?.toLowerCase();
  return u === 'master' || u === 'administrador' || u === 'admin';
};
