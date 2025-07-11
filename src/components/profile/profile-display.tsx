'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function ProfileDisplay() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando perfil...</div>;
  }
  
  if (!user) {
    return <div>No se pudo cargar la información del usuario.</div>;
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
    <Card>
      <CardHeader>
        <CardTitle>Perfil de Usuario</CardTitle>
        <CardDescription>
          Información detallada de tu cuenta y empresa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{`${user.first_name} ${user.last_name}`}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium">Email</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Teléfono</p>
            <p className="text-muted-foreground">{user.telefono || 'No especificado'}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Empresa</p>
            <p className="text-muted-foreground">{user.empresa_nombre}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Rol</p>
            <Badge variant="secondary">{user.rol_display}</Badge>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Estado de la cuenta</p>
            <Badge variant={user.estado ? 'default' : 'destructive'}>
              {user.estado ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Miembro desde</p>
            <p className="text-muted-foreground">{formatDate(user.date_joined)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}