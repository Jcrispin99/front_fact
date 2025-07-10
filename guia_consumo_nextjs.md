# Guía para Consumir API Django desde Next.js con Shadcn

## 🚀 Configuración del Backend (Django)

### CORS Configurado
El backend ya está configurado para permitir requests desde:
- `http://localhost:3000` (Next.js)
- `http://127.0.0.1:3000`
- `http://localhost:5173` (Vite)
- `http://127.0.0.1:5173`

### URLs de la API
- **Base URL**: `http://127.0.0.1:8000/api/v1/`
- **Documentación**: `http://127.0.0.1:8000/swagger/`
- **Admin**: `http://127.0.0.1:8000/admin/`

## 🔧 Solución al Error "Unexpected token '<', '<!DOCTYPE'..."

### Causa del Error
Este error ocurre cuando:
1. La URL de la API es incorrecta (devuelve HTML 404 en lugar de JSON)
2. El servidor no está ejecutándose
3. Problemas de CORS no configurados correctamente

### Verificaciones
1. **Servidor corriendo**: `http://127.0.0.1:8000/swagger/`
2. **URL correcta**: Usar `/api/v1/` como prefijo
3. **Headers correctos**: Incluir `Content-Type: application/json`

## 📱 Configuración de Next.js

### 1. Instalación de Dependencias
```bash
npx create-next-app@latest mi-app --typescript --tailwind --eslint
cd mi-app
npx shadcn-ui@latest init
npm install axios
```

### 2. Configuración del Cliente API

**`lib/api.ts`**
```typescript
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para cookies de sesión
});

// Interceptor para agregar token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/jwt/refresh/`, {
            refresh: refreshToken
          });
          const newToken = response.data.access;
          localStorage.setItem('access_token', newToken);
          // Reintentar request original
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          // Refresh falló, redirigir a login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Servicios de Autenticación

**`lib/auth.ts`**
```typescript
import apiClient from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  re_password: string;
  telefono?: string;
  empresa?: number;
  rol?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  telefono: string;
  empresa: number;
  empresa_nombre: string;
  rol: string;
  rol_display: string;
  is_admin: boolean;
  is_super_admin: boolean;
  date_joined: string;
}

export const authService = {
  // Login
  async login(credentials: LoginCredentials) {
    try {
      const response = await apiClient.post('/auth/jwt/create/', credentials);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error en el login');
    }
  },

  // Registro
  async register(userData: RegisterData) {
    try {
      const response = await apiClient.post('/auth/users/', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.email?.[0] || 'Error en el registro');
    }
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get('/auth/users/me/');
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener usuario');
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
};
```

### 4. Hook de Autenticación

**`hooks/useAuth.ts`**
```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { authService, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });
    const userData = await authService.getCurrentUser();
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
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
```

### 5. Componente de Login con Shadcn

**Instalar componentes necesarios:**
```bash
npx shadcn-ui@latest add button input card form label
```

**`components/LoginForm.tsx`**
```typescript
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 6. Middleware para Rutas Protegidas

**`middleware.ts`**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  
  // Rutas que requieren autenticación
  const protectedPaths = ['/dashboard', '/profile', '/admin'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## 🔍 Debugging y Solución de Problemas

### 1. Verificar Conexión
```typescript
// Test de conexión
const testConnection = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/auth/users/me/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      return;
    }
    
    const data = await response.json();
    console.log('Connection successful:', data);
  } catch (error) {
    console.error('Connection failed:', error);
  }
};
```

### 2. Verificar CORS
```bash
# En el navegador, abrir DevTools > Network
# Verificar que las requests tengan:
# - Status 200 (no 404 o 500)
# - Headers CORS correctos
# - Content-Type: application/json
```

### 3. URLs Importantes para Testing
- **Login**: `POST /api/v1/auth/jwt/create/`
- **Usuario actual**: `GET /api/v1/auth/users/me/`
- **Refresh token**: `POST /api/v1/auth/jwt/refresh/`
- **Registro**: `POST /api/v1/auth/users/`

## 🎯 Próximos Pasos

1. **Implementar Dashboard**: Crear componentes para mostrar datos del usuario
2. **Gestión de Empresas**: Consumir endpoints de companies
3. **Manejo de Productos**: Integrar con la API de products
4. **Sistema de Roles**: Implementar permisos basados en roles
5. **Notificaciones**: Agregar toast notifications con Shadcn

## 📝 Notas Importantes

- **CORS**: Ya configurado para localhost:3000
- **JWT**: Tokens con refresh automático
- **Errores**: Siempre verificar Network tab en DevTools
- **Desarrollo**: Usar `http://127.0.0.1:8000` (no localhost)
- **Producción**: Cambiar URLs en variables de entorno