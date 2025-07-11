'use client';

import { cn } from "@/lib/utils"
import { AlertCircle } from 'lucide-react';
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
import { useForm } from "@/hooks/use-form";

const validationRules = {
  email: (value: string) => {
    if (!value) return 'El email es requerido';
    if (!/\S+@\S+\.\S+/.test(value)) return 'El email no es válido';
    return undefined;
  },
  password: (value: string) => {
    if (!value) return 'La contraseña es requerida';
    if (value.length < 4) return 'La contraseña debe tener al menos 4 caracteres';
    return undefined;
  },
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();

  const {
    formData,
    formErrors,
    isLoading,
    submissionError,
    handleInputChange,
    handleSubmit,
  } = useForm<LoginCredentials>(
    { email: '', password: '' },
    validationRules,
    async (data) => {
      await login(data);
    }
  );

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
              {submissionError && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{submissionError}</span>
                </div>
              )}
              
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleInputChange}
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
