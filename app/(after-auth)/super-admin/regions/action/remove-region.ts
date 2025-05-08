"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { islands, regions } from "@/db/schemas";

export async function removeRegion(regionId: string) {
  const region = await db.query.regions.findFirst({
    where: eq(regions.id, regionId),
  });

  if (!region) {
    return { error: "권역을 찾을 수 없습니다." };
  }

  const foundIslands = await db.query.islands.findMany({
    where: eq(islands.regionId, regionId),
  });

  if (foundIslands.length > 0) {
    return { error: "권역에 섬이 있습니다. 먼저 섬을 삭제해주세요." };
  }

  await db.delete(regions).where(eq(regions.id, regionId));

  return { success: "권역이 성공적으로 삭제되었습니다." };
}
