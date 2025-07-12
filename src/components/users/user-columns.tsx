import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { IconEdit, IconTrash, IconArrowsUpDown } from "@tabler/icons-react"

export const userColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-semibold"
      >
        Nombre
        <IconArrowsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
    filterFn: "includesString",
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-semibold"
      >
        Email
        <IconArrowsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "rol",
    header: "Rol",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.rol_display}</Badge>
    ),
    filterFn: "equals",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.estado ? "default" : "secondary"}>
        {row.original.estado ? "Activo" : "Inactivo"}
      </Badge>
    ),
    filterFn: "equals",
  },
  {
    accessorKey: "empresa_nombre",
    header: "Empresa",
    filterFn: "includesString",
  },
  {
    accessorKey: "date_joined",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-semibold"
      >
        Fecha Registro
        <IconArrowsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      new Date(row.original.date_joined).toLocaleDateString()
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]