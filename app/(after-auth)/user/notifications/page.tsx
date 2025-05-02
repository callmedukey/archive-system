import React from "react";

import NotificationCard from "@/components/shared/notification-card";
import ReadAllNotificationsButton from "@/components/shared/read-all-notifications-button";
import { getNotifications } from "@/lib/utils/db/fetchers/get-notifications";

const page = async () => {
  const notifications = await getNotifications();
  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.isRead
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">알림</h1>
          {unreadCount > 0 && (
            <h2 className="text-lg font-medium text-muted-foreground">
              안읽은 알림 {unreadCount}개
            </h2>
          )}
        </div>
        {hasUnreadNotifications && (
          <ReadAllNotificationsButton
            hasUnreadNotifications={hasUnreadNotifications}
          />
        )}
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
        {notifications.length === 0 && (
          <div className="flex justify-center items-center h-full my-12">
            <p className="text-muted-foreground">알림이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
