import { useState } from "react"
import { ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"

export interface UseGenericTableProps {
  initialPageSize?: number
  initialSorting?: SortingState
  initialFilters?: ColumnFiltersState
  initialGlobalFilter?: string
}

export function useGenericTable({
  initialPageSize = 10,
  initialSorting = [],
  initialFilters = [],
  initialGlobalFilter = "",
}: UseGenericTableProps = {}) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const resetTable = () => {
    setSorting(initialSorting)
    setColumnFilters(initialFilters)
    setGlobalFilter(initialGlobalFilter)
    setRowSelection({})
    setPagination({ pageIndex: 0, pageSize: initialPageSize })
  }

  const clearFilters = () => {
    setColumnFilters([])
    setGlobalFilter("")
  }

  return {
    // Estado
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    
    // Acciones
    resetTable,
    clearFilters,
  }
}