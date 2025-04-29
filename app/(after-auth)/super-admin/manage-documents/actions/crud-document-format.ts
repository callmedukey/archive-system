"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { documentFormats } from "@/db/schemas";

export const createDocumentFormat = async ({
  name,
  content,
  applyActivity,
}: {
  name: string;
  content: string;
  applyActivity: boolean;
}) => {
  try {
    await db.insert(documentFormats).values({
      name,
      content,
      applyActivity,
    });
    revalidatePath("/super-admin/manage-documents");
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "양식 생성에 실패했습니다.",
    };
  }
};

export const updateDocumentFormat = async ({
  id,
  name,
  content,
  applyActivity,
}: {
  id: string;
  name: string;
  content: string;
  applyActivity: boolean;
}) => {
  try {
    await db
      .update(documentFormats)
      .set({
        name,
        content,
        applyActivity,
      })
      .where(eq(documentFormats.id, id));
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "양식 수정에 실패했습니다.",
    };
  }
};

export const deleteDocumentFormat = async ({ id }: { id: string }) => {
  try {
    await db.delete(documentFormats).where(eq(documentFormats.id, id));
    revalidatePath("/super-admin/manage-documents");
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "양식 삭제에 실패했습니다.",
    };
  }
};
