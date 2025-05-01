"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { documents, DocumentStatus } from "@/db/schemas";
import { notifications } from "@/db/schemas/notifications";
import renderBaseRolePathname from "@/lib/utils/parse/render-role-pathname";

export async function requestEdit({
  documentId,
  editRequestReason,
  newStatus,
}: {
  documentId: string;
  editRequestReason: string;
  newStatus: DocumentStatus;
}) {
  const session = await auth();

  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const document = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    columns: {
      userId: true,
      name: true,
    },
  });

  if (!document) {
    return { success: false, error: "문서를 찾을 수 없습니다." };
  }

  if (!document.userId) {
    console.warn(
      `Document ${documentId} has no userId, skipping notification.`
    );
  }

  await db
    .update(documents)
    .set({
      status: newStatus,
      editRequestDate: new Date(),
      editRequestReason,
      editRequestAuthorId: session.user.id,
      editCompletedDate:
        newStatus === DocumentStatus.EDIT_COMPLETED ? new Date() : undefined,
      approvedDate:
        newStatus === DocumentStatus.APPROVED ? new Date() : undefined,
    })
    .where(eq(documents.id, documentId));

  if (document.userId) {
    let notificationTitle = "";
    let notificationContent = "";

    switch (newStatus) {
      case DocumentStatus.EDIT_REQUESTED:
        notificationTitle = "문서 수정 요청";
        notificationContent = `"${document.name}" 문서에 대한 수정이 요청되었습니다.`;
        break;
      case DocumentStatus.APPROVED:
        notificationTitle = "문서 승인";
        notificationContent = `"${document.name}" 문서가 승인되었습니다.`;
        break;
      default:
        break;
    }

    if (notificationTitle && notificationContent) {
      await db.insert(notifications).values({
        userId: document.userId,
        title: notificationTitle,
        content: notificationContent,
        documentId: documentId,
      });
    }
  }

  revalidatePath(
    `/${renderBaseRolePathname(session.user.role)}/documents/${documentId}`
  );

  return { success: true };
}
