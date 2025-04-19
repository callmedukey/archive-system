import { eq, inArray, count, ilike, or, and } from "drizzle-orm";
import React from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  FetchedNoticesWithoutContent,
  Role,
  notices,
  users,
  usersToIslands,
} from "@/db/schemas";

interface NoticeWrapperProps {
  role: Role;
  page: number;
  limit: number;
  query: string;
  children: (
    fetchedNotices: FetchedNoticesWithoutContent[] | null,
    totalCount: number
  ) => React.ReactNode;
}

const NoticesWrapper = async ({
  role,
  page,
  limit,
  query,
  children,
}: NoticeWrapperProps) => {
  const session = await auth();
  if (!session?.user?.id) {
    return children(null, 0);
  }

  const userId = session.user.id;
  const offset = (page - 1) * limit;

  const searchCondition = query
    ? or(
        ilike(notices.title, `%${query}%`),
        ilike(notices.content, `%${query}%`)
      )
    : undefined;

  const baseDataQuery = db.select().from(notices).$dynamic();
  const baseCountQuery = db
    .select({ count: count(notices.id) })
    .from(notices)
    .$dynamic();

  const conditions = [searchCondition].filter(Boolean);
  if (role === Role.SUPERADMIN) {
    // Superadmin sees all notices, conditions only include search
  } else {
    // Admin/User logic - find allowed authors
    const userIslands = await db.query.usersToIslands.findMany({
      columns: { islandId: true },
      where: eq(usersToIslands.userId, userId),
    });
    const islandIds = userIslands.map((ui) => ui.islandId);

    let sameIslandUserIds: string[] = [];
    if (islandIds.length > 0) {
      const sameIslandUsers = await db.query.usersToIslands.findMany({
        columns: { userId: true },
        where: inArray(usersToIslands.islandId, islandIds),
      });
      sameIslandUserIds = sameIslandUsers.map((siu) => siu.userId);
    }

    const superAdmins = await db.query.users.findMany({
      columns: { id: true },
      where: eq(users.role, Role.SUPERADMIN),
    });
    const superAdminIds = superAdmins.map((sa) => sa.id);

    const allowedAuthorIds = [
      ...new Set([...superAdminIds, ...sameIslandUserIds]),
    ];

    if (allowedAuthorIds.length > 0) {
      conditions.push(inArray(notices.authorId, allowedAuthorIds));
    } else {
      // If user has no islands and is not superadmin, they see no notices
      return children([], 0);
    }
  }

  if (conditions.length > 0) {
    const finalCondition = and(...conditions);
    baseDataQuery.where(finalCondition);
    baseCountQuery.where(finalCondition);
  }

  const [fetchedNotices, countResult] = await Promise.all([
    db.query.notices.findMany({
      columns: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        isPinned: true,
        viewCount: true,
        authorId: true,
      },
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
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: (notices, { desc }) => [desc(notices.createdAt)],
      limit: limit,
      offset: offset,
    }),
    baseCountQuery,
  ]);

  const totalCount = countResult[0]?.count ?? 0;

  return children(fetchedNotices, totalCount);
};

export default NoticesWrapper;
