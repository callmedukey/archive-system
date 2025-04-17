"use server";

import { or, ilike } from "drizzle-orm";

import { db } from "@/db";
import { FetchedNotice, notices } from "@/db/schemas/notices";

export const queryNotices = async (
  searchTerm: string
): Promise<FetchedNotice[]> => {
  const results = await db.query.notices.findMany({
    with: {
      author: {
        columns: {
          id: true,
          name: true,
          role: true,
        },
        with: {
          islands: {
            columns: {},
            with: {
              island: true,
            },
          },
        },
      },
    },
    where: or(
      ilike(notices.title, `%${searchTerm}%`),
      ilike(notices.content, `%${searchTerm}%`)
    ),
    orderBy: (notices, { desc }) => [desc(notices.createdAt)],
  });

  return results as FetchedNotice[];
};
