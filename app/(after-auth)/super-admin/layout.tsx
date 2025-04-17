import {
  Bell,
  Home,
  MessageCircle,
  UserCog,
  BookText,
  ScrollText,
  BookOpenText,
} from "lucide-react";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

import { auth } from "@/auth";
import AppSidebar from "@/components/shared/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Role } from "@/db/schemas";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session || session?.user.role !== Role.SUPERADMIN) {
    return redirect("/login");
  }

  const items = [
    {
      label: "알림",
      href: "/super-admin/notifications",
      icon: <Bell />,
    },
    {
      label: "전체 현황판",
      href: "/super-admin",
      icon: <Home />,
    },
    {
      label: "문의사항",
      href: "/super-admin/inquiries",
      icon: <MessageCircle />,
    },
    {
      label: "사용자 관리",
      href: "/super-admin/manage-users",
      icon: <UserCog />,
    },
    {
      label: "자료 관리",
      href: "/super-admin/manage-documents",
      icon: <BookText />,
    },
    {
      label: "카테고리 및 양식관리",
      href: "/super-admin/manage-categories",
      icon: <BookOpenText />,
    },
    {
      label: "공지사항 관리",
      href: "/super-admin/manage-notice",
      icon: <ScrollText />,
    },
  ];

  return (
    <SidebarProvider>
      <Suspense fallback={<AppSidebar items={items} />}>
        <AppSidebar items={items} />
      </Suspense>
      <main className="w-full px-4">
        <SidebarTrigger className="-ml-1" />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default layout;
