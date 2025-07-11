'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface ProfileDisplayProps {
  onEdit?: () => void;
}

export function ProfileDisplay({ onEdit }: ProfileDisplayProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No se pudo cargar la información del usuario.</p>
      </div>
    );
  }

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Perfil de Usuario</CardTitle>
            <CardDescription>
              Información detallada de tu cuenta y empresa.
            </CardDescription>
          </div>
          {onEdit && (
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información personal */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="text-lg">
              {getInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{`${user.first_name} ${user.last_name}`}</h2>
            <p className="text-muted-foreground text-lg">@{user.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.estado ? 'default' : 'destructive'}>
                {user.estado ? 'Activo' : 'Inactivo'}
              </Badge>
              <Badge variant="secondary">{user.rol_display}</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Información de contacto */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Información de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-medium text-sm text-muted-foreground">Email</p>
              <p className="text-base">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm text-muted-foreground">Teléfono</p>
              <p className="text-base">{user.telefono || 'No especificado'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Información empresarial */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Información Empresarial</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-medium text-sm text-muted-foreground">Empresa</p>
              <p className="text-base font-medium">{user.empresa_nombre}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm text-muted-foreground">ID Empresa</p>
              <p className="text-base">{user.empresa}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm text-muted-foreground">Rol</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{user.rol}</Badge>
                <span className="text-sm text-muted-foreground">({user.rol_display})</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm text-muted-foreground">Estado de la cuenta</p>
              <Badge variant={user.estado ? 'default' : 'destructive'} className="w-fit">
                {user.estado ? 'Cuenta Activa' : 'Cuenta Inactiva'}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Información del sistema */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-medium text-sm text-muted-foreground">Miembro desde</p>
              <p className="text-base">{formatDate(user.date_joined)}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm text-muted-foreground">Última actualización</p>
              <p className="text-base">{formatDate(user.fecha_actualizacion)}</p>
            </div>
            {user.is_admin && (
              <div className="space-y-1">
                <p className="font-medium text-sm text-muted-foreground">Permisos especiales</p>
                <div className="flex gap-2">
                  {user.is_admin && <Badge variant="destructive">Administrador</Badge>}
                  {user.is_super_admin && <Badge variant="destructive">Super Admin</Badge>}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}