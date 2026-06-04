
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthUser, LoginRequest, Loja } from '@/services/authTypes';
import { loginUser } from '@/services/authApi';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
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

  useEffect(() => {
    // Verificar se há um usuário salvo no localStorage
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error);
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await loginUser(credentials);
      
      if (response.retorno) {
        const authUser: AuthUser = {
          user: credentials.user,
          lojas: response.lojas,
          isAuthenticated: true,
        };
        
        setUser(authUser);
        localStorage.setItem('authUser', JSON.stringify(authUser));
        return true;
      } else {
        throw new Error(response.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  const getCodhdaList = useCallback((): string[] => {
    return user?.lojas?.map(loja => loja.codhda) || [];
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, getCodhdaList }}>
      {children}
    </AuthContext.Provider>
  );
};
