import { Check, ExternalLink } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { Notification } from "@/db/schemas";
import { cn } from "@/lib/utils";
import renderNotificationLink from "@/lib/utils/parse/render-notification-link";

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
        notification.isRead && "bg-muted/50"
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
          <Button variant="outline" size="sm" className="rounded-lg">
            <Check className="mr-2 h-4 w-4" />
            읽음 처리
          </Button>
          {(notification.noticeId || notification.inquiryId) && (
            <Button asChild variant="default" size="sm" className="rounded-lg">
              <Link
                href={renderNotificationLink({
                  type: notification.noticeId ? "notice" : "inquiries",
                  role: session.user.role,
                  id: (notification.noticeId ??
                    notification.inquiryId) as number,
                })}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
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
