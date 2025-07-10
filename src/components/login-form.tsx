'use client';

import { useState } from 'react';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/hooks/use-auth';
import { LoginCredentials } from '@/lib/auth';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<LoginCredentials>>({});

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};
    
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
    } catch (error) {
      // El error ya se maneja en el hook useAuth
      console.error('Login failed:', error);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tu email y contraseña para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={formErrors.email ? 'border-red-500' : ''}
                  disabled={isLoading}
                  required
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={formErrors.password ? 'border-red-500' : ''}
                  disabled={isLoading}
                  required 
                />
                {formErrors.password && (
                  <p className="text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button"
                  disabled={isLoading}
                >
                  Iniciar con Google
                </Button>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <a href="#" className="underline underline-offset-4">
                Regístrate
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
