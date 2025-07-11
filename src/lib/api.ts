const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Tipos para la API
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

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UserStats {
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_por_rol: Record<string, number>;
  usuarios_por_empresa: Record<string, number>;
}

class ApiClient {
  private static instance: ApiClient;
  
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      throw new Error(error.detail || error.message || `Error ${response.status}`);
    }
    return response.json();
  }

  // ==================== AUTENTICACIÓN ====================
  
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/jwt/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return this.handleResponse<{ access: string; refresh: string }>(response);
  }

  async refreshToken(refresh: string) {
    const response = await fetch(`${API_BASE_URL}/auth/jwt/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    return this.handleResponse<{ access: string }>(response);
  }

  async verifyToken(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/jwt/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return this.handleResponse<object>(response);
  }

  async register(userData: CreateUserData) {
    const response = await fetch(`${API_BASE_URL}/auth/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse<User>(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<User>(response);
  }

  async updateCurrentUser(userData: Partial<UpdateUserData>) {
    const response = await fetch(`${API_BASE_URL}/auth/users/me/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<User>(response);
  }

  async deleteCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/users/me/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<object>(response);
  }

  // ==================== GESTIÓN DE USUARIOS ====================
  
  async getUsers(filters: UserFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/users/?${params}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  async createUser(userData: CreateUserData) {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<User>(response);
  }

  async getUser(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<User>(response);
  }

  async updateUser(id: number, userData: Partial<UpdateUserData>) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<User>(response);
  }

  async deleteUser(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<object>(response);
  }

  // ==================== ENDPOINTS PERSONALIZADOS ====================

  async changeUserPassword(id: number, passwordData: ChangePasswordData) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/change_password/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });
    return this.handleResponse<{ detail: string }>(response);
  }

  async toggleUserStatus(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/toggle_status/`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<User>(response);
  }

  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/stats/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<UserStats>(response);
  }

  // ==================== UTILIDADES ====================
  
  async uploadFile(file: File, endpoint: string) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });
    return this.handleResponse<unknown>(response);
  }

  // Método genérico para endpoints personalizados
  async customRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: unknown
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: this.getAuthHeaders(),
      ...(data ? { body: JSON.stringify(data) } : {})
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = ApiClient.getInstance();
export default apiClient;