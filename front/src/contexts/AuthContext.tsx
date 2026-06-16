import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthUser, LoginRequest } from '@/services/authTypes';
import { loginUser, fetchSession } from '@/services/authApi';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginRequest) => Promise<boolean | string>;
  logout: () => void;
  isLoading: boolean;
  getCodhdaList: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateSession = useCallback(async (token: string): Promise<boolean> => {
    try {
      const session = await fetchSession(token);
      const authUser: AuthUser = {
        ...session.user,
        permissions: session.permissions,
        lojas: session.lojas,
        codhdaList: session.codhdaList,
        store: session.store,
        token,
        isAuthenticated: true,
      };
      setUser(authUser);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      hydrateSession(token).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [hydrateSession]);

  const login = async (credentials: LoginRequest): Promise<boolean | string> => {
    try {
      setIsLoading(true);
      const { token } = await loginUser(credentials);
      localStorage.setItem(TOKEN_KEY, token);
      const ok = await hydrateSession(token);
      if (!ok) return 'Erro ao carregar sessão. Tente novamente.';
      return true;
    } catch (error: any) {
      return error?.message || false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const getCodhdaList = useCallback((): string[] => {
    return user?.codhdaList || [];
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, getCodhdaList }}>
      {children}
    </AuthContext.Provider>
  );
};
