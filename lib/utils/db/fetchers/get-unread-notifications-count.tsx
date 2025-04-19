"server only";

import { and, eq, count } from "drizzle-orm";
import { cache } from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import { notifications } from "@/db/schemas";

export const getUnreadNotificationsCount = cache(async () => {
  const session = await auth();

  if (!session) {
    return 0;
  }

  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false)
      )
    );

  return result[0].count;
});
