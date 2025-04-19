"server only";

import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { notifications } from "@/db/schemas";

export const getNotifications = async () => {
  const session = await auth();

  if (!session) {
    return [];
  }

  return await db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
  });
};
