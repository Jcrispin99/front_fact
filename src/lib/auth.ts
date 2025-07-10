const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

export class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/auth/jwt/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al iniciar sesión');
    }

    const tokens = await response.json();
    this.setTokens(tokens);
    return tokens;
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/jwt/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Error al renovar el token');
    }

    const tokens = await response.json();
    this.setTokens(tokens);
    return tokens;
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/users/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado, intentar renovar
        await this.refreshToken();
        return this.getCurrentUser();
      }
      throw new Error('Error al obtener información del usuario');
    }

    return response.json();
  }

  logout(): void {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!this.getAccessToken();
  }

  private setTokens(tokens: AuthTokens): void {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    
    // También establecer cookies para el middleware
    if (typeof document !== 'undefined') {
      document.cookie = `access_token=${tokens.access}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      document.cookie = `refresh_token=${tokens.refresh}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
  }

  // Problema: Uso de localStorage en el servidor
  private getAccessToken(): string | null {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  private clearTokens(): void {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // También limpiar cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }

  getAuthHeader(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export const authService = AuthService.getInstance();