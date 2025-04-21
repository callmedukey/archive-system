"server only";

import { desc, eq } from "drizzle-orm";
import { cache } from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import { notifications } from "@/db/schemas";

export const getNotifications = cache(async (limit: number = 50) => {
  const session = await auth();

  if (!session) {
    return [];
  }

  return await db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    orderBy: desc(notifications.createdAt),
    limit,
  });
});
