"use server";

import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  CreateNoticeSchema,
  EditNoticeSchema,
  files,
  images,
  NewNotice,
  notices,
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
