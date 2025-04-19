"use server";

import { eq, and, or, inArray } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  CreateNoticeSchema,
  EditNoticeSchema,
  files,
  images,
  NewNotice,
  notices,
  Role,
  notifications,
  users,
  User,
  usersToIslands,
} from "@/db/schemas";
import { ActionResponse } from "@/types/action";

export const createNotice = async (
  data: NewNotice
): Promise<ActionResponse<NewNotice>> => {
  const result = CreateNoticeSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "입력 값이 올바르지 않습니다.",
    };
  }

  const {
    title,
    content,
    isPinned,
    images: newImages,
    files: newFiles,
  } = result.data;

  const session = await auth();

  if (!session) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    };
  }

  const [notice] = await db
    .insert(notices)
    .values({ title, content, isPinned, authorId: session.user.id })
    .returning();

  const noticeId = notice.id;

  const imagePromises = newImages.map((image) =>
    db
      .update(images)
      .set({ noticeId })
      .where(eq(images.url, image.url) && eq(images.key, image.key))
  );
  const filePromises = newFiles.map((file) =>
    db
      .update(files)
      .set({ noticeId })
      .where(eq(files.url, file.url) && eq(files.key, file.key))
  );

  await Promise.all([...imagePromises, ...filePromises]);

  //NOTIFICATIONS
  if (session.user.role === Role.SUPERADMIN) {
    const allUsers = await db.query.users.findMany();

    const notificationValues = allUsers
      .filter((user) => user.id !== session.user.id)
      .map((user) => ({
        title: `새 공지사항: ${title}`,
        content: `${title} - 새 공지사항이 등록되었습니다.`,
        userId: user.id,
        noticeId: noticeId,
      }));

    if (notificationValues.length > 0) {
      await db.insert(notifications).values(notificationValues);
    }
  } else if (session.user.role === Role.ADMIN) {
    // Find islands associated with the admin
    const adminIslandRelations = await db.query.usersToIslands.findMany({
      where: eq(usersToIslands.userId, session.user.id),
      columns: { islandId: true },
    });
    const adminIslandIds = adminIslandRelations.map(
      (relation) => relation.islandId
    );

    if (adminIslandIds.length > 0) {
      // Find users and admins in the same islands
      const usersInSameIslandsQuery = db
        .select({ user: users })
        .from(usersToIslands)
        .innerJoin(users, eq(usersToIslands.userId, users.id))
        .where(
          and(
            inArray(usersToIslands.islandId, adminIslandIds),
            or(eq(users.role, Role.USER), eq(users.role, Role.ADMIN))
          )
        );

      // Find all superadmins
      const superAdminsQuery = db.query.users.findMany({
        where: eq(users.role, Role.SUPERADMIN),
      });

      const [usersInSameIslands, superAdmins] = await Promise.all([
        usersInSameIslandsQuery,
        superAdminsQuery,
      ]);

      // Combine recipients, ensuring uniqueness and excluding the author
      const recipients = new Map<string, User>();

      usersInSameIslands.forEach(({ user }) => {
        if (user.id !== session.user.id) {
          recipients.set(user.id, user);
        }
      });

      superAdmins.forEach((user) => {
        if (user.id !== session.user.id) {
          recipients.set(user.id, user);
        }
      });

      // Create notification values
      const notificationValues = Array.from(recipients.values()).map(
        (user) => ({
          title: `새 공지사항: ${title}`,
          content: `${title} - 새 공지사항이 등록되었습니다.`,
          userId: user.id,
          noticeId: noticeId,
        })
      );

      // Insert notifications
      if (notificationValues.length > 0) {
        await db.insert(notifications).values(notificationValues);
      }
    }
  }

  return {
    success: true,
    message: "공지가 성공적으로 생성되었습니다.",
  };
};

export const editNotice = async (
  data: NewNotice & { id: number }
): Promise<ActionResponse<NewNotice & { id: number }>> => {
  const result = EditNoticeSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "입력 값이 올바르지 않습니다.",
    };
  }

  const {
    id,
    title,
    content,
    isPinned,
    images: newImages,
    files: newFiles,
  } = result.data;

  const session = await auth();

  if (!session) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    };
  }

  const [notice] = await db
    .update(notices)
    .set({ title, content, isPinned })
    .where(eq(notices.id, id))
    .returning();

  const noticeId = notice.id;

  const imagePromises = newImages.map((image) =>
    db
      .update(images)
      .set({ noticeId })
      .where(eq(images.url, image.url) && eq(images.key, image.key))
  );
  const filePromises = newFiles.map((file) =>
    db
      .update(files)
      .set({ noticeId })
      .where(eq(files.url, file.url) && eq(files.key, file.key))
  );

  await Promise.all([...imagePromises, ...filePromises]);

  return {
    success: true,
    message: "공지가 성공적으로 수정되었습니다.",
  };
};
