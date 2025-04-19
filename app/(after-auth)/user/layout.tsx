import { Bell, Home, MessageCircle, BookText, ScrollText } from "lucide-react";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

import { auth } from "@/auth";
import AppSidebar from "@/components/shared/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Role } from "@/db/schemas";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session || session?.user.role !== Role.USER) {
    return redirect("/login");
  }

  const items = [
    {
      label: "알림",
      href: "/user/notifications",
      icon: <Bell />,
    },
    {
      label: "전체 현황판",
      href: "/user",
      icon: <Home />,
    },
    {
      label: "문의사항",
      href: "/user/inquiries",
      icon: <MessageCircle />,
    },
    {
      label: "자료 관리",
      href: "/user/documents",
      icon: <BookText />,
    },
    {
      label: "공지사항",
      href: "/user/notice",
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
