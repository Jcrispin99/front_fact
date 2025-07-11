'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, CreateUserData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface RegisterFormProps {
  className?: string;
}

export function RegisterForm({ className }: RegisterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<CreateUserData & { confirmPassword: string }>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    rol: 'empleado'
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validar email
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Validar username
    if (!formData.username) {
      errors.username = 'El username es requerido';
    } else if (formData.username.length < 3) {
      errors.username = 'El username debe tener al menos 3 caracteres';
    }

    // Validar nombre
    if (!formData.first_name) {
      errors.first_name = 'El nombre es requerido';
    }

    // Validar apellido
    if (!formData.last_name) {
      errors.last_name = 'El apellido es requerido';
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar teléfono (opcional pero si se proporciona debe ser válido)
    if (formData.telefono && !/^[+]?[0-9\s\-()]+$/.test(formData.telefono)) {
      errors.telefono = 'El teléfono no es válido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Crear el objeto de datos sin confirmPassword
      const { confirmPassword, ...userData } = formData;
      
      await apiClient.register(userData);
      
      setSuccess(true);
      setError(null);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login?message=Registro exitoso. Ahora puedes iniciar sesión.');
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (success) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-800">¡Registro Exitoso!</h3>
            <p className="text-green-600">
              Tu cuenta ha sido creada correctamente. Serás redirigido al login en unos segundos...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
        <CardDescription>
          Completa los datos para registrarte en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mensaje de error general */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={fieldErrors.first_name ? 'border-red-500' : ''}
                disabled={loading}
              />
              {fieldErrors.first_name && (
                <p className="text-sm text-red-600">{fieldErrors.first_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className={fieldErrors.last_name ? 'border-red-500' : ''}
                disabled={loading}
              />
              {fieldErrors.last_name && (
                <p className="text-sm text-red-600">{fieldErrors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={fieldErrors.email ? 'border-red-500' : ''}
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={fieldErrors.username ? 'border-red-500' : ''}
              disabled={loading}
            />
            {fieldErrors.username && (
              <p className="text-sm text-red-600">{fieldErrors.username}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              className={fieldErrors.telefono ? 'border-red-500' : ''}
              disabled={loading}
              placeholder="+51 999 999 999"
            />
            {fieldErrors.telefono && (
              <p className="text-sm text-red-600">{fieldErrors.telefono}</p>
            )}
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select value={formData.rol} onValueChange={(value) => handleInputChange('rol', value)}>
              <SelectTrigger className={fieldErrors.rol ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.rol && (
              <p className="text-sm text-red-600">{fieldErrors.rol}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={fieldErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={fieldErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Botón de registro */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrarse'
            )}
          </Button>

          {/* Link al login */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}