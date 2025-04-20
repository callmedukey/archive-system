"use server";

import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { notices, Role } from "@/db/schemas";
import { utapi } from "@/lib/utils/server/uploadthing";
import { ActionResponse } from "@/types/action";

export const deleteNotice = async (
  noticeId: number
): Promise<ActionResponse<null>> => {
  const session = await auth();

  if (!session) {
    return { message: "권한이 없습니다", success: false };
  }

  const currentRole = session.user.role;

  const notice = await db.query.notices.findFirst({
    where: eq(notices.id, noticeId),
    with: {
      author: {
        columns: {
          id: true,
          role: true,
        },
      },
      images: true,
      files: true,
    },
  });

  if (!notice) {
    return { message: "공지사항을 찾을 수 없습니다", success: false };
  }

  if (
    currentRole !== Role.SUPERADMIN &&
    notice.author?.id !== session.user.id
  ) {
    return { message: "권한이 없습니다", success: false };
  }

  await db.delete(notices).where(eq(notices.id, noticeId));

  await Promise.all([
    utapi.deleteFiles(notice.images.map((image) => image.key)),
    utapi.deleteFiles(notice.files.map((file) => file.key)),
  ]);

  return { message: "공지사항이 삭제되었습니다", success: true };
};
