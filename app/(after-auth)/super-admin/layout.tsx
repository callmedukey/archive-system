import {
  Bell,
  Home,
  MessageCircle,
  UserCog,
  BookText,
  ScrollText,
  BookOpenText,
  MapPin,
} from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import AppSidebar from "@/components/shared/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Role } from "@/db/schemas";
import { getUnreadNotificationsCount } from "@/lib/utils/db/fetchers/get-unread-notifications-count";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session || session?.user.role !== Role.SUPERADMIN) {
    return redirect("/login");
  }

  const unreadNotificationsCount = await getUnreadNotificationsCount();
  const items = [
    {
      label: `알림 ${
        unreadNotificationsCount > 0 ? `(${unreadNotificationsCount})` : ""
      }`,
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
      href: "/super-admin/users",
      icon: <UserCog />,
    },
    {
      label: "권역 관리",
      href: "/super-admin/regions",
      icon: <MapPin />,
    },
    {
      label: "자료 관리",
      href: "/super-admin/documents",
      icon: <BookText />,
    },
    {
      label: "양식 관리",
      href: "/super-admin/manage-documents",
      icon: <BookOpenText />,
    },
    {
      label: "공지사항 관리",
      href: "/super-admin/notice",
      icon: <ScrollText />,
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar items={items} />
      <main className="w-full px-4">
        <SidebarTrigger className="-ml-1" />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default layout;
