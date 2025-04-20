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
    pinnedNotices: FetchedNoticesWithoutContent[] | null,
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
    return children(null, null, 0);
  }

  const userId = session.user.id;
  const offset = (page - 1) * limit;

  const searchCondition = query
    ? or(
        ilike(notices.title, `%${query}%`),
        ilike(notices.content, `%${query}%`)
      )
    : undefined;

  // Base conditions for non-pinned notices
  const baseConditions = [eq(notices.isPinned, false)];
  if (searchCondition) {
    baseConditions.push(searchCondition);
  }

  // Base conditions for pinned notices
  const pinnedConditions = [eq(notices.isPinned, true)];
  // Pinned notices ignore the search query

  let allowedAuthorIds: string[] | null = null;

  if (role !== Role.SUPERADMIN) {
    // Admin/User logic - find allowed authors for both pinned and non-pinned
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

    // Allowed authors for non-pinned: same island + superadmins
    allowedAuthorIds = [...new Set([...superAdminIds, ...sameIslandUserIds])];

    // Allowed authors for pinned: same island + superadmins (same logic applies here)
    const allowedPinnedAuthorIds = allowedAuthorIds;

    if (allowedAuthorIds.length === 0) {
      // If user has no islands and is not superadmin, they see no notices
      return children([], [], 0);
    }

    baseConditions.push(inArray(notices.authorId, allowedAuthorIds));
    pinnedConditions.push(inArray(notices.authorId, allowedPinnedAuthorIds));
  }
  // Superadmin sees all notices, so no author conditions added for them

  const finalBaseCondition =
    baseConditions.length > 0 ? and(...baseConditions) : undefined;
  const finalPinnedCondition =
    pinnedConditions.length > 0 ? and(...pinnedConditions) : undefined;

  const noticeColumns = {
    id: true,
    title: true,
    createdAt: true,
    updatedAt: true,
    isPinned: true,
    viewCount: true,
    authorId: true,
  };

  // Define the structure for fetching related data according to Drizzle types
  const noticeRelations = {
    author: {
      columns: {
        id: true,
        name: true,
        role: true,
      },
      with: {
        islands: {
          // The relation name in usersRelations (many(usersToIslands))
          // No columns needed from the join table itself
          with: {
            island: {
              // The relation name defined in usersToIslandsRelations
              // Specify the columns needed from the related island table
              columns: {
                id: true,
                name: true,
                // Add other island columns if needed
              },
            },
          },
        },
      },
    },
  };

  const [pinnedNotices, fetchedNotices, countResult] = await Promise.all([
    // Pinned notices query (no limit/offset, ignore search)
    db.query.notices.findMany({
      columns: noticeColumns,
      with: noticeRelations, // Use the correctly structured relations object
      where: finalPinnedCondition,
      orderBy: (notices, { desc }) => [desc(notices.createdAt)],
    }),
    // Regular (non-pinned) notices query
    db.query.notices.findMany({
      columns: noticeColumns,
      with: noticeRelations, // Use the correctly structured relations object
      where: finalBaseCondition,
      orderBy: (notices, { desc }) => [desc(notices.createdAt)],
      limit: limit,
      offset: offset,
    }),
    // Count query for non-pinned notices matching filters
    db
      .select({ count: count(notices.id) })
      .from(notices)
      .where(finalBaseCondition),
  ]);

  const totalCount = countResult[0]?.count ?? 0;

  return children(
    pinnedNotices as FetchedNoticesWithoutContent[],
    fetchedNotices as FetchedNoticesWithoutContent[],
    totalCount
  );
};

export default NoticesWrapper;
