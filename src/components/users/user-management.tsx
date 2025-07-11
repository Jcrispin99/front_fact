'use client';

import React, { useState, useEffect } from 'react';
import { useUsers, useUserPermissions } from '@/hooks/use-users';
import { User, CreateUserData, UpdateUserData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertCircle, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Key, Users, BarChart3 } from 'lucide-react';

interface UserManagementProps {
  className?: string;
}

export function UserManagement({ className }: UserManagementProps) {
  const {
    users,
    loading,
    error,
    stats,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    fetchUserStats,
    clearError
  } = useUsers();

  const permissions = useUserPermissions();
  
  const [filters, setFilters] = useState({
    search: '',
    rol: '',
    estado: '',
    ordering: '-fecha_creacion'
  });
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (permissions.canViewStats) {
      fetchUserStats();
    }
  }, [permissions.canViewStats, fetchUserStats]);

  const convertFilters = (rawFilters: typeof filters) => ({
    search: rawFilters.search || undefined,
    rol: rawFilters.rol || undefined,
    estado: rawFilters.estado ? rawFilters.estado === 'true' : undefined,
    ordering: rawFilters.ordering
  });

  const handleSearch = () => {
    fetchUsers(convertFilters(filters));
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      await createUser(userData);
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleUpdateUser = async (id: number, userData: Partial<UpdateUserData>) => {
    try {
      await updateUser(id, userData);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(id);
      } catch (error) {
        // Error ya manejado por el hook
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleUserStatus(id);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const getRoleBadgeVariant = (rol: string) => {
    switch (rol) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'empleado': return 'secondary';
      default: return 'outline';
    }
  };

  if (!permissions.canViewCompanyUsers) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No tienes permisos para ver esta sección.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          {permissions.canViewStats && (
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filtros y búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra los usuarios de tu {permissions.canViewAllUsers ? 'sistema' : 'empresa'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por email, nombre o username..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Select value={filters.rol} onValueChange={(value) => setFilters(prev => ({ ...prev, rol: value }))}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los roles</SelectItem>
                    <SelectItem value="empleado">Empleado</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {permissions.isSuperAdmin && (
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Select value={filters.estado} onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value }))}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="true">Activos</SelectItem>
                    <SelectItem value="false">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={loading}>
                  Buscar
                </Button>
                {permissions.canCreateUsers && (
                  <Sheet open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <SheetTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo Usuario
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <CreateUserForm onSubmit={handleCreateUser} onCancel={() => setIsCreateModalOpen(false)} />
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mensajes de error */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    Cerrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabla de usuarios */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Cargando usuarios...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.rol)}>
                            {user.rol_display}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.estado ? 'default' : 'secondary'}>
                            {user.estado ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.empresa_nombre}</TableCell>
                        <TableCell>
                          {new Date(user.date_joined).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {permissions.canEditUsers && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {permissions.canToggleUserStatus && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(user.id)}
                              >
                                {user.estado ? (
                                  <ToggleRight className="h-4 w-4" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {permissions.canDeleteUsers && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {users.length} de {pagination.count} usuarios
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.previous || loading}
                  onClick={() => fetchUsers({ ...convertFilters(filters), page: pagination.currentPage - 1 })}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.next || loading}
                  onClick={() => fetchUsers({ ...convertFilters(filters), page: pagination.currentPage + 1 })}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Estadísticas */}
        {permissions.canViewStats && (
          <TabsContent value="stats">
            <StatsPanel stats={stats} loading={loading} />
          </TabsContent>
        )}
      </Tabs>

      {/* Modal de edición */}
      <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <SheetContent>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSubmit={(userData) => handleUpdateUser(selectedUser.id, userData)}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Componente para crear usuario
function CreateUserForm({ onSubmit, onCancel }: {
  onSubmit: (userData: CreateUserData) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    telefono: '',
    rol: 'empleado'
  });
  const [loading, setLoading] = useState(false);
  const permissions = useUserPermissions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SheetHeader>
        <SheetTitle>Crear Nuevo Usuario</SheetTitle>
        <SheetDescription>
          Completa los datos para crear un nuevo usuario
        </SheetDescription>
      </SheetHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Apellido</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required
            minLength={6}
          />
        </div>
        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
          />
        </div>
        {permissions.canChangeRoles && (
          <div>
            <Label htmlFor="rol">Rol</Label>
            <Select value={formData.rol} onValueChange={(value) => setFormData(prev => ({ ...prev, rol: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                {permissions.isSuperAdmin && (
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creando...' : 'Crear Usuario'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

// Componente para editar usuario
function EditUserForm({ user, onSubmit, onCancel }: {
  user: User;
  onSubmit: (userData: Partial<UpdateUserData>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<UpdateUserData>>({
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    telefono: user.telefono,
    rol: user.rol
  });
  const [loading, setLoading] = useState(false);
  const permissions = useUserPermissions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SheetHeader>
        <SheetTitle>Editar Usuario</SheetTitle>
        <SheetDescription>
          Modifica los datos del usuario {user.first_name} {user.last_name}
        </SheetDescription>
      </SheetHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit_first_name">Nombre</Label>
            <Input
              id="edit_first_name"
              value={formData.first_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="edit_last_name">Apellido</Label>
            <Input
              id="edit_last_name"
              value={formData.last_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="edit_email">Email</Label>
          <Input
            id="edit_email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="edit_username">Username</Label>
          <Input
            id="edit_username"
            value={formData.username || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="edit_telefono">Teléfono</Label>
          <Input
            id="edit_telefono"
            value={formData.telefono || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
          />
        </div>
        {permissions.canChangeRoles && (
          <div>
            <Label htmlFor="edit_rol">Rol</Label>
            <Select value={formData.rol} onValueChange={(value) => setFormData(prev => ({ ...prev, rol: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                {permissions.isSuperAdmin && (
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

// Componente de estadísticas
function StatsPanel({ stats, loading }: { stats: any; loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando estadísticas...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay estadísticas disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_usuarios}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.usuarios_activos}</div>
        </CardContent>
      </Card>
      {/* Agregar más estadísticas según sea necesario */}
    </div>
  );
}