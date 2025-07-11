'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, UpdateUserData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, ArrowLeft, Shield, User, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProfileFormProps {
  onCancel?: () => void;
}

interface ExtendedUpdateUserData extends UpdateUserData {
  estado?: boolean;
  rol?: string;
  empresa?: number;
  username?: string;
}

export function ProfileForm({ onCancel }: ProfileFormProps) {
  const { user, refreshUser, isLoading } = useAuth();
  const [formData, setFormData] = useState<ExtendedUpdateUserData>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determinar permisos basados en el rol del usuario
  const canEditAll = user?.is_super_admin || false;
  const canEditStatus = user?.is_admin || user?.is_super_admin || false;

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        telefono: user.telefono,
        estado: user.estado,
        rol: user.rol,
        empresa: user.empresa,
        username: user.username,
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ExtendedUpdateUserData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (user?.id) {
        // Filtrar datos según permisos
        let dataToUpdate: ExtendedUpdateUserData = {};
        
        if (canEditAll) {
          // Superadministradores pueden actualizar todo
          dataToUpdate = formData;
        } else if (canEditStatus) {
          // Administradores solo pueden cambiar el estado y datos de contacto
          dataToUpdate = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            telefono: formData.telefono,
            estado: formData.estado,
          };
        } else {
          // Usuarios normales solo datos de contacto
          dataToUpdate = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            telefono: formData.telefono,
          };
        }

        await apiClient.updateUser(user.id, dataToUpdate);
        setSuccess('Perfil actualizado con éxito');
        await refreshUser();
        setTimeout(() => {
          if (onCancel) onCancel();
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el perfil';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  const getRoleIcon = () => {
    if (canEditAll) return <Shield className="h-4 w-4" />;
    if (canEditStatus) return <Settings className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const getRoleDescription = () => {
    if (canEditAll) return "Como superadministrador, puedes editar todos los campos";
    if (canEditStatus) return "Como administrador, puedes editar información de contacto y estado de cuenta";
    return "Puedes editar tu información de contacto";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {getRoleIcon()}
              Editar Perfil
            </CardTitle>
            <CardDescription>{getRoleDescription()}</CardDescription>
          </div>
          <Badge variant={canEditAll ? "destructive" : canEditStatus ? "secondary" : "outline"}>
            {canEditAll ? "Super Admin" : canEditStatus ? "Admin" : "Usuario"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          
          {/* Información Personal - Todos pueden editar */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={isLoading || isSubmitting}
                  placeholder="Ingresa tu nombre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={isLoading || isSubmitting}
                  placeholder="Ingresa tu apellido"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto - Todos pueden editar */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Información de Contacto</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading || isSubmitting}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono || ''}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  disabled={isLoading || isSubmitting}
                  placeholder="+51 999 000 000"
                />
              </div>
            </div>
          </div>

          {/* Estado de Cuenta - Solo Admin y Super Admin */}
          {canEditStatus && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración de Cuenta
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="estado">Estado de la cuenta</Label>
                      <p className="text-sm text-muted-foreground">
                        Controla si la cuenta está activa o inactiva
                      </p>
                    </div>
                    <Switch
                      id="estado"
                      checked={formData.estado || false}
                      onCheckedChange={(checked) => handleInputChange('estado', checked)}
                      disabled={isLoading || isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Configuración Avanzada - Solo Super Admin */}
          {canEditAll && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuración Avanzada
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de usuario</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={isLoading || isSubmitting}
                      placeholder="nombre_usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Select
                      value={formData.rol || ''}
                      onValueChange={(value) => handleInputChange('rol', value)}
                      disabled={isLoading || isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empleado">Empleado</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="super_admin">Super Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa">ID de Empresa</Label>
                    <Input
                      id="empresa"
                      type="number"
                      value={formData.empresa || ''}
                      onChange={(e) => handleInputChange('empresa', parseInt(e.target.value))}
                      disabled={isLoading || isSubmitting}
                      placeholder="ID de la empresa"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Perfil'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}