export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires: number;
}

export interface Loja {
  codhda: string;
  empresa: string;
  sigla_loja: string;
}

export interface SessionResponse {
  user: {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  store: { id: number; name: string } | null;
  lojas: Loja[];
  codhdaList: string[];
  permissions: string[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  permissions: string[];
  lojas: Loja[];
  codhdaList: string[];
  store: SessionResponse['store'];
  token: string;
  isAuthenticated: boolean;
}
