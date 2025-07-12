// Re-exportar tipos desde el cliente de API para mantener compatibilidad
export type { User, CreateUserData, UpdateUserData, UserFilters, ApiResponse, UserStats } from '@/types/user';
import type { User } from '@/types/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Tipos adicionales para la autenticación
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}