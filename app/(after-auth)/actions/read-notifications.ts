"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  notifications,
  ReadNotificationSchema,
  ReadNotificationSchemaType,
} from "@/db/schemas";
import renderBaseRolePathname from "@/lib/utils/parse/render-role-pathname";
import { ActionResponse } from "@/types/action";

export async function readSingleNotification(
  _: ActionResponse<ReadNotificationSchemaType> | null,
  formData: FormData
) {
  const session = await auth();

  if (!session) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    };
  }

  const data = formData.get("notificationId");

  if (!data) {
    return {
      success: false,
      message: "알림 ID가 필요합니다.",
    };
  }
  const result = ReadNotificationSchema.safeParse({
    notificationId: Number(data),
  });

  if (!result.success) {
    return {
      success: false,
      message: "알림 ID가 유효하지 않습니다.",
      errors: result.error?.flatten().fieldErrors,
    };
  }

  const { notificationId } = result.data;

  await db
    .update(notifications)
    .set({
      isRead: sql`not ${notifications.isRead}`,
    })
    .where(eq(notifications.id, notificationId));

  revalidatePath(
    `/${renderBaseRolePathname(session.user.role)}/notifications`,
    "page"
  );

  return {
    success: true,
    message: "알림 읽음 상태 변경이 완료되었습니다.",
  };
}

export async function readAllNotifications() {
  const session = await auth();

  if (!session) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    };
  }

  await db
    .update(notifications)
    .set({
      isRead: true,
    })
    .where(eq(notifications.userId, session.user.id));

  revalidatePath(
    `/${renderBaseRolePathname(session.user.role)}/notifications`,
    "page"
  );

  return {
    success: true,
    message: "모든 알림을 읽음 처리했습니다.",
  };
}
