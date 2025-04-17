import Link from "next/link";

import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarProps {
  items: {
    label: string;
    href: string;
    icon: React.ReactNode;
  }[];
}

function AppSidebar({ items }: SidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="text-lg font-bold">아카이브 시스템</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href}>
                  {item.icon} {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="outline"
          onClick={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          로그아웃
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
