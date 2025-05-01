"use server";

import { eq, or, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  documents,
  files,
  images,
  NewDocumentSchema,
  NewDocumentType,
  notifications,
  users,
  Role,
  usersToRegions,
  DocumentStatus,
} from "@/db/schemas";
import renderFirstDocumentName from "@/lib/utils/parse/render-first-document-name";
import renderBaseRolePathname from "@/lib/utils/parse/render-role-pathname";

export type EditDocumentProps = NewDocumentType & {
  userId: string;
  formatId: string;
  newFiles: { url: string; key: string }[];
  newImages: { url: string; key: string }[];
  content: string;
  documentId: string;
};

export const submitEditDocument = async ({
  userId,
  formatId,
  newFiles,
  newImages,
  content,
  documentId,
  ...submittedData
}: EditDocumentProps) => {
  const session = await auth();
  if (!session) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    };
  }

  const result = NewDocumentSchema.safeParse(submittedData);

  if (!result.success) {
    return {
      success: false,
      message: "입력 값이 올바르지 않습니다.",
      error: result.error.flatten().fieldErrors,
    };
  }

  const { data } = result;

  const reportMonth = data.reportDate.getMonth() + 1;
  const reportYear = data.reportDate.getFullYear();

  try {
    const userRegions = await db.query.usersToRegions.findMany({
      where: eq(usersToRegions.userId, userId),
      columns: { regionId: true },
    });

    const creatorRegionId =
      userRegions.length > 0 ? userRegions[0].regionId : null;

    const [document] = await db
      .update(documents)
      .set({
        ...data,
        userId,
        formatId,
        reportMonth,
        reportYear,
        name: renderFirstDocumentName({
          reportMonth,
          name: data.name,
        }),
        content,
        status: DocumentStatus.EDIT_COMPLETED,
      })
      .where(eq(documents.id, documentId))
      .returning({ id: documents.id });

    const imagePromises = newImages.map((image) =>
      db
        .update(images)
        .set({ documentId: document.id })
        .where(eq(images.url, image.url) && eq(images.key, image.key))
    );
    const filePromises = newFiles.map((file) =>
      db
        .update(files)
        .set({ documentId: document.id })
        .where(eq(files.url, file.url) && eq(files.key, file.key))
    );

    await Promise.all([...imagePromises, ...filePromises]);

    const usersToNotifyQuery = db
      .selectDistinct({ id: users.id })
      .from(users)
      .leftJoin(usersToRegions, eq(users.id, usersToRegions.userId))
      .where(
        or(
          eq(users.role, Role.SUPERADMIN),
          creatorRegionId
            ? and(
                eq(users.role, Role.ADMIN),
                eq(usersToRegions.regionId, creatorRegionId)
              )
            : undefined
        )
      );

    const usersToNotify = await usersToNotifyQuery;

    const notificationData = usersToNotify.map((user) => ({
      userId: user.id,
      documentId: document.id,
      title: "문서가 수정되었습니다.",
      content: `등록자 ${
        session.user.username
      }에 의해 ${renderFirstDocumentName({
        reportMonth,
        name: data.name,
      })} 문서가 수정되었습니다.`,
    }));

    if (notificationData.length > 0) {
      await db.insert(notifications).values(notificationData);
    }

    revalidatePath(
      `/${renderBaseRolePathname(session.user.role)}/documents/${documentId}`
    );

    return {
      success: true,
      message: "문서가 수정되었습니다.",
      documentId: document.id,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "문서 수정 중 오류가 발생했습니다.",
    };
  }
};
