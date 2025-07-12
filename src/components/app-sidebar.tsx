"use client"

import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useAuth } from '@/hooks/use-auth';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: IconUsers, // Consider changing the icon to something more personal
    },
  ];

  // Conditional rendering for the 'Users' link
  if (user?.is_super_admin || user?.is_admin) {
    navMain.push({
      title: "Usuarios",
      url: "/dashboard/users", // Corrected URL
      icon: IconUsers,
    });
  }

  const data = {
    navMain,
    navSecondary: [
// ... existing code ...
      ],
      documents: [],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
                {user && (
          <NavUser 
            user={{
              name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              avatar: '' // You can add an avatar URL if available in your user object
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
