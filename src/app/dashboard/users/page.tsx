'use client'

import { GenericTable } from '@/components/generic-table'
import { userColumns } from '@/components/users/user-columns'
import { useUsers } from '@/hooks/use-users'

export default function UsersPage() {
  const { users, loading } = useUsers()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      <GenericTable
        data={users}
        columns={userColumns}
        loading={loading}
        emptyMessage="No se encontraron usuarios"
      />
    </div>
  )
}