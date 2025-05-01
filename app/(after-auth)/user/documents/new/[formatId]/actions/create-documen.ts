"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  documents,
  files,
  images,
  NewDocumentSchema,
  NewDocumentType,
} from "@/db/schemas";

type CreateDocumentProps = NewDocumentType & {
  userId: string;
  formatId: string;
  newFiles: { url: string; key: string }[];
  newImages: { url: string; key: string }[];
};

export const createDocument = async ({
  userId,
  formatId,
  newFiles,
  newImages,
  ...submittedData
}: CreateDocumentProps) => {
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
    const [document] = await db
      .insert(documents)
      .values({
        ...data,
        userId,
        formatId,
        reportMonth,
        reportYear,
        name: `${reportMonth}월 ${data.name} V1`,
      })
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

    return {
      success: true,
      message: "문서가 생성되었습니다.",
      documentId: document.id,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "문서 생성에 실패했습니다.",
    };
  }
};
