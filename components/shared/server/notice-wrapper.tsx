import { eq, inArray } from "drizzle-orm";
import React from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  FetchedNotice,
  Role,
  notices,
  users,
  usersToIslands,
} from "@/db/schemas";

interface NoticeWrapperProps {
  role: Role;
  children: (fetchedNotices: FetchedNotice[] | null) => React.ReactNode;
}

const NoticeWrapper = async ({ role, children }: NoticeWrapperProps) => {
  let fetchedNotices: FetchedNotice[] | null = null;
  const session = await auth();

  if (!session) {
    return null;
  }

  const userId = session.user.id;

  if (role === Role.SUPERADMIN) {
    // Superadmin sees all notices
    fetchedNotices = await db.query.notices.findMany({
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
      orderBy: (notices, { desc }) => [desc(notices.createdAt)], // Optional: order by creation date
    });
  } else {
    // Admin and User logic
    // 1. Get current user's island IDs
    const userIslands = await db.query.usersToIslands.findMany({
      columns: { islandId: true },
      where: eq(usersToIslands.userId, userId),
    });
    const islandIds = userIslands.map((ui) => ui.islandId);

    // 2. Get user IDs in those islands
    let sameIslandUserIds: string[] = [];
    if (islandIds.length > 0) {
      const sameIslandUsers = await db.query.usersToIslands.findMany({
        columns: { userId: true },
        where: inArray(usersToIslands.islandId, islandIds),
      });
      sameIslandUserIds = sameIslandUsers.map((siu) => siu.userId);
    }

    // 3. Get Superadmin user IDs
    const superAdmins = await db.query.users.findMany({
      columns: { id: true },
      where: eq(users.role, Role.SUPERADMIN),
    });
    const superAdminIds = superAdmins.map((sa) => sa.id);

    // 4. Combine author IDs (Superadmins + users in the same island)
    const allowedAuthorIds = [
      ...new Set([...superAdminIds, ...sameIslandUserIds]),
    ];

    // 5. Fetch notices from allowed authors
    if (allowedAuthorIds.length > 0) {
      fetchedNotices = await db.query.notices.findMany({
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        where: inArray(notices.authorId, allowedAuthorIds),
        orderBy: (notices, { desc }) => [desc(notices.createdAt)], // Optional: order by creation date
      });
    } else {
      fetchedNotices = [];
    }
  }
  return children(fetchedNotices);
};

export default NoticeWrapper;
