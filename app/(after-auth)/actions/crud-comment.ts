"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  comments,
  CreateCommentSchema,
  CreateCommentSchemaType,
  Role,
  users,
} from "@/db/schemas";
import renderBaseRolePathname from "@/lib/utils/parse/render-role-pathname";
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

  const { content, noticeId, inquiryId, documentId } = result.data;

  const promises = [
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    }),
  ];

  if (noticeId) {
    promises.push(
      db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      })
    );
  }

  if (inquiryId) {
    promises.push(
      db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      })
    );
  }

  if (documentId) {
    promises.push(
      db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      })
    );
  }
  const [user] = await Promise.all(promises);

  if (!user) {
    response.message = "존재하지 않는 사용자입니다.";
    return response;
  }

  if (noticeId) {
    await db.insert(comments).values({
      content,
      noticeId,
      authorId: user.id,
    });
  }

  if (inquiryId) {
    await db.insert(comments).values({
      content,
      inquiryId,
      authorId: user.id,
    });
  }

  if (documentId) {
    await db.insert(comments).values({
      content,
      documentId,
      authorId: user.id,
    });
  }
  if (noticeId) {
    revalidatePath(
      `/${renderBaseRolePathname(session.user.role as Role)}/notice/${noticeId}`
    );
  }

  if (inquiryId) {
    revalidatePath(
      `/${renderBaseRolePathname(
        session.user.role as Role
      )}/inquiries/${inquiryId}`
    );
  }

  if (documentId) {
    revalidatePath(
      `/${renderBaseRolePathname(
        session.user.role as Role
      )}/documents/${documentId}`
    );
  }

  response.success = true;
  response.message = "댓글이 성공적으로 작성되었습니다.";

  response.inputs = {
    content: "",
    noticeId: inputs.noticeId,
    inquiryId: inputs.inquiryId,
  };
  return response;
}

export async function deleteComment(commentId: string) {
  const session = await auth();

  if (!session || session.user.role !== Role.SUPERADMIN) {
    return { success: false, message: "관리자 권한이 필요합니다." };
  }

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, Number(commentId)),
  });

  if (!comment) {
    return { success: false, message: "존재하지 않는 댓글입니다." };
  }

  await db.delete(comments).where(eq(comments.id, Number(commentId)));

  revalidatePath(
    `/${renderBaseRolePathname(session.user.role as Role)}/notice/${
      comment.noticeId
    }`
  );
  revalidatePath(
    `/${renderBaseRolePathname(session.user.role as Role)}/inquiries/${
      comment.inquiryId
    }`
  );
  revalidatePath(
    `/${renderBaseRolePathname(session.user.role as Role)}/documents/${
      comment.documentId
    }`
  );

  return { success: true, message: "댓글이 성공적으로 삭제되었습니다." };
}

export async function updateComment(commentId: string, content: string) {
  const session = await auth();

  if (!session || session.user.role !== Role.SUPERADMIN) {
    return { success: false, message: "관리자 권한이 필요합니다." };
  }

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, Number(commentId)),
  });

  if (!comment) {
    return { success: false, message: "존재하지 않는 댓글입니다." };
  }

  await db
    .update(comments)
    .set({ content })
    .where(eq(comments.id, Number(commentId)));

  revalidatePath(
    `/${renderBaseRolePathname(session.user.role as Role)}/notice/${
      comment.noticeId
    }`
  );
  revalidatePath(
    `/${renderBaseRolePathname(session.user.role as Role)}/inquiries/${
      comment.inquiryId
    }`
  );
  revalidatePath(
    `/${renderBaseRolePathname(session.user.role as Role)}/documents/${
      comment.documentId
    }`
  );

  return { success: true, message: "댓글이 성공적으로 수정되었습니다." };
}
