"use server";

import { eq, and, or, inArray } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  CreateInquirySchema,
  EditInquirySchema,
  files,
  images,
  inquiries,
  NewInquiry,
  notifications,
  Role,
  users,
  usersToIslands,
} from "@/db/schemas";
import { ActionResponse } from "@/types/action";

export const createInquiry = async (
  data: NewInquiry
): Promise<ActionResponse<NewInquiry>> => {
  const result = CreateInquirySchema.safeParse(data);
  console.log(result);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "입력 값이 올바르지 않습니다.",
    };
  }

  const { title, content, images: newImages, files: newFiles } = result.data;

  const session = await auth();

  if (!session) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    };
  }

  const [inquiry] = await db
    .insert(inquiries)
    .values({ title, content, userId: session.user.id })
    .returning();

  const inquiryId = inquiry.id;

  const imagePromises = newImages.map((image) =>
    db
      .update(images)
      .set({ inquiryId })
      .where(eq(images.url, image.url) && eq(images.key, image.key))
  );
  const filePromises = newFiles.map((file) =>
    db
      .update(files)
      .set({ inquiryId })
      .where(eq(files.url, file.url) && eq(files.key, file.key))
  );

  await Promise.all([...imagePromises, ...filePromises]);

  if (session.user.role === Role.USER) {
    const userIslandLink = await db.query.usersToIslands.findFirst({
      where: eq(usersToIslands.userId, session.user.id),
      columns: {
        islandId: true,
      },
    });

    // Find admins in the same island AND all super admins
    const usersToNotify = await db.query.users.findMany({
      where: or(
        userIslandLink
          ? and(
              eq(users.role, Role.ADMIN),
              // Check if user's ID is in the list of user IDs for the target island
              inArray(
                users.id,
                db
                  .select({ userId: usersToIslands.userId })
                  .from(usersToIslands)
                  .where(eq(usersToIslands.islandId, userIslandLink.islandId))
              )
            )
          : undefined,
        eq(users.role, Role.SUPERADMIN)
      ),
      columns: {
        id: true,
      },
    });

    const notificationValues = usersToNotify
      .filter((user) => user.id !== session.user.id)
      .map((user) => ({
        title: `새 문의 등록: ${inquiry.title}`,
        content: `새로운 문의 '${inquiry.title}'가 등록되었습니다. 확인해주세요.`,
        userId: user.id,
        inquiryId: inquiry.id,
      }));

    if (notificationValues.length > 0) {
      await db.insert(notifications).values(notificationValues);
    }
  }

  return {
    success: true,
    message: "문의가 성공적으로 생성되었습니다.",
  };
};

export const editInquiry = async (
  data: NewInquiry & { id: number }
): Promise<ActionResponse<NewInquiry & { id: number }>> => {
  const result = EditInquirySchema.safeParse(data);

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

  const [inquiry] = await db
    .update(inquiries)
    .set({ title, content })
    .where(eq(inquiries.id, id))
    .returning();

  const inquiryId = inquiry.id;

  const imagePromises = newImages.map((image) =>
    db
      .update(images)
      .set({ inquiryId })
      .where(eq(images.url, image.url) && eq(images.key, image.key))
  );
  const filePromises = newFiles.map((file) =>
    db
      .update(files)
      .set({ inquiryId })
      .where(eq(files.url, file.url) && eq(files.key, file.key))
  );

  await Promise.all([...imagePromises, ...filePromises]);

  return {
    success: true,
    message: "문의가 성공적으로 수정되었습니다.",
  };
};
