"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  islands,
  users,
  usersToIslands,
  usersToRegions,
  VerificationStatus,
} from "@/db/schemas";

export const updateVerifiedStatus = async (
  userId: string,
  verified: VerificationStatus
) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { error: "사용자를 찾을 수 없습니다." };
  }

  const [verifiedUser] = await db
    .update(users)
    .set({ verified })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      username: users.username,
    });

  if (verified === VerificationStatus.VERIFIED) {
    const userRegionInfo = await db.query.usersToRegions.findFirst({
      columns: { regionId: true },
      where: eq(usersToRegions.userId, verifiedUser.id),
      with: { region: true },
    });

    if (!userRegionInfo) {
      return { error: "사용자의 지역 정보를 찾을 수 없습니다." };
    }

    const regionId = userRegionInfo.regionId;

    const [island] = await db
      .insert(islands)
      .values({
        name: verifiedUser.username,
        regionId: regionId,
      })
      .returning();

    await db.insert(usersToIslands).values({
      userId: user.id,
      islandId: island.id,
    });
  }

  revalidatePath("/super-admin/manage-users");

  return { message: "가입상태가 성공적으로 업데이트되었습니다." };
};
