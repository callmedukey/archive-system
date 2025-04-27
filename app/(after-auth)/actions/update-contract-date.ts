"use server";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schemas";

export async function updateContractDate(userId: string, from: Date, to: Date) {
  if (!userId || !from || !to) {
    return {
      success: false,
      message: "모든 필드가 필요합니다.",
    };
  }

  if (from > to) {
    return {
      success: false,
      message: "시작일이 종료일보다 더 이후일 수 없습니다.",
    };
  }

  await db
    .update(users)
    .set({
      contractPeriodStart: new Date(from),
      contractPeriodEnd: new Date(to),
    })
    .where(eq(users.id, userId));

  return {
    success: true,
    message: "계약 기간이 업데이트되었습니다.",
  };
}
