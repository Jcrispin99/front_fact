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
