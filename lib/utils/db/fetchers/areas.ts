"server only";

import { cache } from "react";

import { db } from "@/db";

export const getRegions = cache(async () => {
  const regions = await db.query.regions.findMany({
    orderBy: (regions, { desc }) => [desc(regions.name)],
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));
  return regions;
});

export const getIslands = cache(async (regionId?: string) => {
  if (!regionId) {
    return [];
  }

  const islands = await db.query.islands.findMany({
    where: (islands, { eq }) => eq(islands.regionId, regionId),
    orderBy: (islands, { desc }) => [desc(islands.name)],
  });

  return islands;
});
