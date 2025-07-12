// src/types/user.ts

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  telefono: string;
  empresa: number;
  empresa_nombre: string;
  rol: 'super_admin' | 'admin' | 'empleado';
  rol_display: string;
  estado: boolean;
  is_admin: boolean;
  is_super_admin: boolean;
  date_joined: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateUserData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  telefono?: string;
  empresa?: number;
  rol?: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  telefono?: string;
  empresa?: number;
  rol?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  re_new_password: string;
}

export interface UserFilters {
  rol?: string;
  empresa?: number;
  estado?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface UserStats {
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_por_rol: Record<string, number>;
  usuarios_por_empresa: Record<string, number>;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}