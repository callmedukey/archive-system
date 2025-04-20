"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { regions, Role } from "@/db/schemas";
import { CreateRegionSchema } from "@/lib/schemas/auth/region.schema";
import { ActionResponse } from "@/types/action";

export const addRegion = async (
  name: string
): Promise<ActionResponse<null>> => {
  const session = await auth();

  if (!session || session.user.role !== Role.SUPERADMIN) {
    return {
      success: false,
      message: "권역을 추가할 권한이 없습니다.",
    };
  }
  const result = CreateRegionSchema.safeParse({ name });

  if (!result.success) {
    return { success: false, message: "권역 이름이 유효하지 않습니다." };
  }

  const existingRegion = await db.query.regions.findFirst({
    where: eq(regions.name, result.data.name),
  });

  if (existingRegion) {
    return { success: false, message: "이미 존재하는 권역입니다." };
  }

  await db.insert(regions).values({ name: result.data.name });

  revalidatePath("/super-admin/regions");

  return {
    success: true,
    message: "권역이 성공적으로 추가되었습니다.",
  };
};
