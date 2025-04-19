import React from "react";

import NotificationCard from "@/components/shared/notification-card";
import { Button } from "@/components/ui/button";
import { getNotifications } from "@/lib/utils/db/fetchers/get-notifications";

interface NotificationsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    isRead?: "true" | "false";
  }>;
}

const page = async ({ searchParams }: NotificationsPageProps) => {
  const notifications = await getNotifications();
  // Removed unused variables: page, limit, isRead
  // const { page, limit, isRead } = await searchParams;
  await searchParams; // Await the promise even if not destructuring

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">알림</h1>
          <h2 className="text-lg font-medium text-muted-foreground">
            새로운 알림 {notifications.length}개
          </h2>
        </div>
        <Button className="rounded-lg">모두 읽음처리</Button>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => {
          return (
            <NotificationCard
              key={notification.id}
              notification={notification}
            />
          );
        })}
      </div>
    </div>
  );
};

export default page;
