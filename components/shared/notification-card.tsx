import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { Notification } from "@/db/schemas";
import { cn } from "@/lib/utils";
import renderNotificationLink from "@/lib/utils/parse/render-notification-link";

import ReadNotificationButton from "./read-notification-button";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard = async ({ notification }: NotificationCardProps) => {
  const session = await auth();

  if (!session) {
    return null;
  }

  return (
    <Card
      key={notification.id}
      className={cn(
        "flex flex-row shadow-md",
        notification.isRead && "bg-muted-foreground/20 shadow-none"
      )}
    >
      <div className="flex-1">
        <CardHeader>
          <CardTitle>{notification.title}</CardTitle>
          <CardDescription>
            {new Date(notification.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">{notification.content}</CardContent>
      </div>
      <div className="flex items-center pr-4">
        <div className="flex flex-col gap-2">
          <ReadNotificationButton
            notificationId={notification.id}
            isRead={notification.isRead}
          />
          {(notification.noticeId ||
            notification.inquiryId ||
            notification.documentId) && (
            <Button asChild variant="default" size="sm" className="rounded-lg">
              <Link
                href={renderNotificationLink({
                  type: notification.noticeId
                    ? "notice"
                    : notification.inquiryId
                    ? "inquiries"
                    : "documents",
                  role: session.user.role,
                  id: (notification.noticeId ??
                    notification.inquiryId ??
                    notification.documentId) as number,
                })}
              >
                <ExternalLink className="mr-auto h-4 w-4" />
                내용 보기
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NotificationCard;
