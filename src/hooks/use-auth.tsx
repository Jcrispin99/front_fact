'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService, LoginCredentials } from '@/lib/auth';
import { User } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
   refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Optionally handle the error, e.g., by logging out the user
      // if the token is invalid and cannot be refreshed.
    } finally {
      setIsLoading(false);
    }
  };
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // No crear usuario falso, simplemente limpiar la sesión
      authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.login(credentials);
      
      // Obtener datos del usuario después del login exitoso
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      router.push('/dashboard');
    } catch (error) {
      console.error("Login failed:", error); // Bueno para depuración
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      setError(errorMessage);
      // No es necesario relanzar el error, el estado `error` del hook es suficiente para que la UI reaccione.
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook simple para verificar el estado de autenticación sin acceder a todo el contexto.
// Utiliza el contexto principal para evitar llamadas de API y estados redundantes.
export function useAuthStatus() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}
