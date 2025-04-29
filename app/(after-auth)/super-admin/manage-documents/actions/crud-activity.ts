"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  ActivityContentSchema,
  ActivityTypeSchema,
  documentActivityContents,
  documentActivityTypes,
} from "@/db/schemas";
import { ActionResponse } from "@/types/action";

export const createActivityType = async (
  _: ActionResponse<{
    name: string;
    textCode: string;
  }>,
  formData: FormData
) => {
  const inputs = Object.fromEntries(formData.entries());
  const result = ActivityTypeSchema.safeParse(inputs);

  if (!result.success) {
    return {
      success: false,
      inputs: {
        name: String(inputs.name ?? ""),
        textCode: String(inputs.textCode ?? ""),
      },
      errors: result.error.flatten().fieldErrors,
      message: "활동 분류 생성 실패",
    };
  }

  await db.insert(documentActivityTypes).values({
    name: result.data.name,
    textCode: result.data.textCode,
  });

  revalidatePath("/super-admin/manage-documents/activities");

  return {
    success: true,
    message: "활동 분류가 성공적으로 생성되었습니다.",
    errors: undefined,
  };
};

export const updateActivityType = async ({
  id,
  name,
  textCode,
}: {
  id: string;
  name: string;
  textCode: string;
}) => {
  if (!id || !name || !textCode) {
    return {
      success: false,
      message: "모든 필드를 입력해주세요.",
    };
  }

  const result = ActivityTypeSchema.safeParse({
    name,
    textCode,
  });

  if (!result.success) {
    return {
      success: false,
      message: "활동 분류 수정 실패",
    };
  }

  await db
    .update(documentActivityTypes)
    .set({
      name: result.data.name,
      textCode: result.data.textCode,
    })
    .where(eq(documentActivityTypes.id, id));

  revalidatePath("/super-admin/manage-documents/activities");

  return {
    success: true,
    message: "활동 분류가 성공적으로 수정되었습니다.",
    errors: undefined,
  };
};

export const deleteActivityType = async ({ id }: { id: string }) => {
  try {
    await db
      .delete(documentActivityTypes)
      .where(eq(documentActivityTypes.id, id));

    revalidatePath("/super-admin/manage-documents/activities");

    return {
      success: true,
      message: "활동 분류가 성공적으로 삭제되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "활동 분류 삭제 실패",
    };
  }
};

export const createActivityContent = async (
  _: ActionResponse<{
    name?: string;
    numericalCode?: number;
    activityTypeId?: string;
  }>,
  formData: FormData
) => {
  const inputs = Object.fromEntries(formData.entries());
  const result = ActivityContentSchema.safeParse(inputs);

  if (!result.success) {
    return {
      success: false,
      message: "활동 내용 생성 실패",
      inputs,
      errors: result.error.flatten().fieldErrors,
    };
  }

  await db.insert(documentActivityContents).values({
    name: result.data.name,
    numericalCode: result.data.numericalCode,
    activityTypeId: result.data.activityTypeId,
  });

  revalidatePath("/super-admin/manage-documents/activities");

  return {
    success: true,
    message: "활동 내용이 성공적으로 생성되었습니다.",
    inputs: result.data,
    errors: undefined,
  };
};

export const updateActivityContent = async ({
  id,
  name,
  numericalCode,
  activityTypeId,
}: {
  id: string;
  name: string;
  numericalCode: number;
  activityTypeId: string;
}) => {
  if (!id || !name || !numericalCode || !activityTypeId) {
    return {
      success: false,
      message: "모든 필드를 입력해주세요.",
    };
  }

  const result = ActivityContentSchema.safeParse({
    name,
    numericalCode,
    activityTypeId,
  });

  if (!result.success) {
    return {
      success: false,
      message: "활동 내용 수정 실패",
    };
  }

  await db
    .update(documentActivityContents)
    .set({
      name: result.data.name,
      numericalCode: result.data.numericalCode,
      activityTypeId: result.data.activityTypeId,
    })
    .where(eq(documentActivityContents.id, id));

  revalidatePath("/super-admin/manage-documents/activities");

  return {
    success: true,
    message: "활동 내용이 성공적으로 수정되었습니다.",
    errors: undefined,
  };
};

export const deleteActivityContent = async ({ id }: { id: string }) => {
  try {
    await db
      .delete(documentActivityContents)
      .where(eq(documentActivityContents.id, id));

    revalidatePath("/super-admin/manage-documents/activities");

    return {
      success: true,
      message: "활동 내용이 성공적으로 삭제되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "활동 내용 삭제 실패",
    };
  }
};
