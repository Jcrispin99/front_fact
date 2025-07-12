import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "first_name",
    header: "Nombre",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </div>
        <div className="text-sm text-muted-foreground">
          @{row.original.username}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "rol_display",
    header: "Rol",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.rol_display}</Badge>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.estado ? "default" : "secondary"}>
        {row.original.estado ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]