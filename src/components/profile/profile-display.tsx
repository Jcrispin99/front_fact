'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil de Usuario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{`${user.first_name} ${user.last_name}`}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Información Adicional</h3>
          <div className="text-sm text-muted-foreground">
            <p>Teléfono: {user.telefono || 'No disponible'}</p>
            <p>Empresa: {user.empresa_nombre || 'No disponible'}</p>
            <p>Rol: {user.rol_display || 'No disponible'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}