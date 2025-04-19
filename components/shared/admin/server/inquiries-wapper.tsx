import { desc, ilike, or, and, eq, inArray, asc, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  inquiries,
  users,
  Role,
  usersToIslands,
  InquiryWithUser,
} from "@/db/schemas";

interface InquiriesWrapperProps {
  searchTerm: string;
  page: number;
  limit: number;
  orderBy: "asc" | "desc";
  children: (data: InquiryWithUser[], totalCount: number) => React.ReactNode;
}

const InquiriesWrapper = async ({
  searchTerm,
  page,
  limit = 10,
  orderBy,
  children,
}: InquiriesWrapperProps) => {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/login");
  }

  const currentUserId = session.user.id;
  const currentUserRole = session.user.role as Role;

  const offset = (page - 1) * limit;

  const searchCondition = searchTerm
    ? or(
        ilike(inquiries.title, `%${searchTerm}%`),
        ilike(inquiries.content, `%${searchTerm}%`)
      )
    : undefined;

  let orderByFunction = desc;
  const orderByColumn = inquiries.createdAt;

  if (orderBy) {
    if (orderBy === "asc") {
      orderByFunction = asc;
    }
  }

  // --- Common Query Setup ---
  const buildFilteredQuery = async () => {
    const baseDataQuery = db
      .select({
        inquiry: inquiries,
        user: { username: users.username }, // Select necessary fields for data
      })
      .from(inquiries)
      .leftJoin(users, eq(inquiries.userId, users.id))
      .$dynamic();

    const baseCountQuery = db
      .select({ count: count(inquiries.id) }) // Select count
      .from(inquiries)
      .leftJoin(users, eq(inquiries.userId, users.id))
      .$dynamic();

    const conditions = [searchCondition].filter(Boolean);
    let joinNeeded = false;
    let adminIslandIds: string[] = [];

    if (currentUserRole === Role.ADMIN) {
      const adminIslandLinks = await db
        .select({ islandId: usersToIslands.islandId })
        .from(usersToIslands)
        .where(eq(usersToIslands.userId, currentUserId));
      adminIslandIds = adminIslandLinks.map((link) => link.islandId);

      if (adminIslandIds.length === 0) {
        return { query: null, countQuery: null }; // Short-circuit
      }

      joinNeeded = true; // Need usersToIslands join
      conditions.push(
        eq(users.role, Role.USER),
        inArray(usersToIslands.islandId, adminIslandIds)
      );
    } else if (currentUserRole === Role.USER) {
      conditions.push(eq(inquiries.userId, currentUserId));
    }

    // Apply joins if needed
    if (joinNeeded) {
      baseDataQuery.leftJoin(
        usersToIslands,
        eq(users.id, usersToIslands.userId)
      );
      baseCountQuery.leftJoin(
        usersToIslands,
        eq(users.id, usersToIslands.userId)
      );
    }

    // Apply conditions if any exist
    if (conditions.length > 0) {
      const finalCondition = and(...conditions);
      baseDataQuery.where(finalCondition);
      baseCountQuery.where(finalCondition);
    }

    return { query: baseDataQuery, countQuery: baseCountQuery };
  };

  const { query: dataQueryBuilder, countQuery: countQueryBuilder } =
    await buildFilteredQuery();

  // Handle admin with no islands case
  if (!dataQueryBuilder || !countQueryBuilder) {
    return children([], 0);
  }

  // --- Apply specific modifiers and Fetch ---
  const dataQuery = dataQueryBuilder
    .orderBy(orderByFunction(orderByColumn))
    .limit(limit)
    .offset(offset);

  const [foundInquiriesResult, countResult] = await Promise.all([
    dataQuery, // Execute the finalized data query
    countQueryBuilder, // Execute the count query
  ]);

  const totalCount = countResult[0]?.count ?? 0;

  return children(foundInquiriesResult, totalCount);
};

export default InquiriesWrapper;
