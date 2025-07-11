'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, User, CreateUserData, UpdateUserData, UserFilters, ApiResponse, UserStats } from '@/lib/api';
import { useAuth } from './use-auth';

export interface UseUsersReturn {
  // Estado
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  stats: UserStats | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    totalPages: number;
  };
  
  // Acciones
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<User>;
  updateUser: (id: number, userData: Partial<UpdateUserData>) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  toggleUserStatus: (id: number) => Promise<User>;
  changeUserPassword: (id: number, currentPassword: string, newPassword: string) => Promise<void>;
  fetchUserStats: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  clearError: () => void;
}

export function useUsers(initialFilters: UserFilters = {}): UseUsersReturn {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
    totalPages: 1
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUsers = useCallback(async (newFilters: UserFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedFilters = { ...filters, ...newFilters };
      setFilters(mergedFilters);
      
      const response = await apiClient.getUsers(mergedFilters);
      
      setUsers(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
        currentPage: mergedFilters.page || 1,
        totalPages: Math.ceil(response.count / (mergedFilters.page_size || 20))
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createUser = useCallback(async (userData: CreateUserData): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      const newUser = await apiClient.createUser(userData);
      
      // Actualizar la lista de usuarios
      setUsers(prev => [newUser, ...prev]);
      
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: number, userData: Partial<UpdateUserData>): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await apiClient.updateUser(id, userData);
      
      // Actualizar la lista de usuarios
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ));
      
      // Si es el usuario actual, actualizar también
      if (currentUser?.id === id) {
        setCurrentUser(updatedUser);
      }
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const deleteUser = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.deleteUser(id);
      
      // Remover de la lista
      setUsers(prev => prev.filter(user => user.id !== id));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (id: number): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await apiClient.toggleUserStatus(id);
      
      // Actualizar la lista de usuarios
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ));
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado del usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const changeUserPassword = useCallback(async (
    id: number, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.changeUserPassword(id, {
        current_password: currentPassword,
        new_password: newPassword,
        re_new_password: newPassword
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar contraseña';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserStats = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const userStats = await apiClient.getUserStats();
      setStats(userStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(async (): Promise<void> => {
    await fetchUsers(filters);
  }, [fetchUsers, filters]);

  // Cargar usuario actual al montar el componente
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  // Cargar usuarios inicialmente
  useEffect(() => {
    if (authUser) {
      fetchUsers(initialFilters);
    }
  }, [authUser]); // Solo depende de authUser para evitar loops

  return {
    // Estado
    users,
    currentUser,
    loading,
    error,
    stats,
    pagination,
    
    // Acciones
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    changeUserPassword,
    fetchUserStats,
    refreshUsers,
    clearError
  };
}

// Hook específico para el perfil del usuario actual
export function useCurrentUserProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(async (userData: Partial<UpdateUserData>): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await apiClient.updateCurrentUser(userData);
      
      // El hook useAuth se encargará de actualizar el contexto
      if (updateUser) {
        updateUser(updatedUser);
      }
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    updateProfile,
    clearError
  };
}

// Hook para verificar permisos basado en el rol
export function useUserPermissions() {
  const { user } = useAuth();

  const canViewAllUsers = user?.is_super_admin || false;
  const canViewCompanyUsers = user?.is_admin || user?.is_super_admin || false;
  const canCreateUsers = user?.is_admin || user?.is_super_admin || false;
  const canEditUsers = user?.is_admin || user?.is_super_admin || false;
  const canDeleteUsers = user?.is_super_admin || false;
  const canChangeRoles = user?.is_super_admin || false;
  const canViewStats = user?.is_admin || user?.is_super_admin || false;
  const canToggleUserStatus = user?.is_admin || user?.is_super_admin || false;

  return {
    canViewAllUsers,
    canViewCompanyUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canChangeRoles,
    canViewStats,
    canToggleUserStatus,
    userRole: user?.rol || 'empleado',
    isAdmin: user?.is_admin || false,
    isSuperAdmin: user?.is_super_admin || false
  };
}