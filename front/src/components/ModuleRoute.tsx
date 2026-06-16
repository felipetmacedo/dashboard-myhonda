import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { NoPermission } from './NoPermission';

interface ModuleRouteProps {
  children: ReactNode;
  permissionKey?: string;
}

export const ModuleRoute = ({ children, permissionKey }: ModuleRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user?.isAuthenticated) return <LoginForm />;

  if (permissionKey) {
    const hasAccess = user.isAdmin || user.permissions?.includes(`${permissionKey}.READ`);
    if (!hasAccess) return <NoPermission />;
  }

  return <>{children}</>;
};
