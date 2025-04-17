"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  comments,
  CreateCommentSchema,
  CreateCommentSchemaType,
  notices,
  users,
} from "@/db/schemas";
import { ActionResponse } from "@/types/action";

export async function createComment(
  _: ActionResponse<CreateCommentSchemaType> | null,
  formData: FormData
) {
  const inputs = Object.fromEntries(
    formData
  ) as unknown as CreateCommentSchemaType;

  const response: ActionResponse<CreateCommentSchemaType> = {
    success: false,
    message: "",
    inputs,
  };

  const session = await auth();

  if (!session) {
    response.message = "로그인이 필요합니다.";
    return response;
  }

  const result = CreateCommentSchema.safeParse(inputs);

  if (!result.success) {
    response.errors = result.error?.flatten().fieldErrors;
    response.message = "입력 항목을 확인해주세요.";
    return response;
  }

  const { content, noticeId } = result.data;

  const [user, notice] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    }),
    db.query.notices.findFirst({
      where: eq(notices.id, noticeId),
    }),
  ]);

  if (!user || !notice) {
    response.message = "존재하지 않는 사용자 또는 공지입니다.";
    return response;
  }

  await db.insert(comments).values({
    content,
    noticeId,
    authorId: user.id,
  });

  revalidatePath(`/super-admin/manage-notice/${noticeId}`);

  response.success = true;
  response.message = "댓글이 성공적으로 작성되었습니다.";

  response.inputs = {
    content: "",
    noticeId: inputs.noticeId,
  };
  return response;
}
