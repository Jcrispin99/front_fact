'use client';

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { useAuth } from '@/hooks/use-auth';

import data from "./data.json"

export default function Page() {
  const { user } = useAuth();
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {user && (
            <div className="px-4 lg:px-6">
              <h2 className="text-2xl font-bold tracking-tight">¡Bienvenido, {user.first_name}!</h2>
              <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad.</p>
            </div>
          )}
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  )
}
