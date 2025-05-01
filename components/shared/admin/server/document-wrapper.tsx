import {
  desc,
  ilike,
  or,
  and,
  eq,
  inArray,
  asc,
  count,
  gte,
  lte,
  SQL,
} from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  documents,
  users,
  Role,
  usersToRegions,
  documentFormats,
  DocumentStatus,
} from "@/db/schemas";

export type DocumentWithUser = typeof documents.$inferSelect & {
  user: { username: string | null } | null;
};

interface DocumentWrapperProps {
  searchTerm?: string;
  page?: number;
  limit?: number;
  orderBy?: "asc" | "desc";
  dataType?: string;
  status?: string;
  step?: string;
  regionId?: string;
  islandId?: string;
  dateFrom?: string;
  dateTo?: string;
  children: (
    data: DocumentWithUser[],
    totalCount: number,
    queryDocumentFormats: (typeof documentFormats.$inferSelect)[]
  ) => React.ReactNode;
}
const DocumentWrapper = async ({
  searchTerm,
  page = 1,
  limit = 10,
  orderBy,
  dataType,
  status,
  step,
  regionId,
  islandId,
  dateFrom,
  dateTo,
  children,
}: DocumentWrapperProps) => {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/login");
  }

  const currentUserId = session.user.id;
  const currentUserRole = session.user.role as Role;

  const offset = (page - 1) * limit;

  const searchCondition = searchTerm
    ? or(
        ilike(documents.name, `%${searchTerm}%`),
        ilike(documents.islandName, `%${searchTerm}%`),
        ilike(documents.regionName, `%${searchTerm}%`),
        ilike(documents.reporter, `%${searchTerm}%`)
      )
    : undefined;

  let orderByFunction = desc;
  const orderByColumn = documents.createdAt;

  if (orderBy) {
    if (orderBy === "asc") {
      orderByFunction = asc;
    }
  }

  const buildFilteredQuery = async () => {
    const baseDataQuery = db
      .select({
        id: documents.id,
        name: documents.name,
        islandName: documents.islandName,
        regionName: documents.regionName,
        reportDate: documents.reportDate,
        reportMonth: documents.reportMonth,
        reportYear: documents.reportYear,
        reporter: documents.reporter,
        contractPeriodStart: documents.contractPeriodStart,
        contractPeriodEnd: documents.contractPeriodEnd,
        reportingCompany: documents.reportingCompany,
        level: documents.level,
        status: documents.status,
        typeName: documents.typeName,
        typeContent: documents.typeContent,
        activityPeriodStart: documents.activityPeriodStart,
        activityPeriodEnd: documents.activityPeriodEnd,
        activityLocation: documents.activityLocation,
        innerActivityParticipantsNumber:
          documents.innerActivityParticipantsNumber,
        outerActivityParticipantsNumber:
          documents.outerActivityParticipantsNumber,
        formatId: documents.formatId,
        userId: documents.userId,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        user: { username: users.username },
        editRequestDate: documents.editRequestDate,
        editCompletedDate: documents.editCompletedDate,
        approvedDate: documents.approvedDate,
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .$dynamic();

    const baseCountQuery = db
      .select({ count: count(documents.id) })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .$dynamic();

    const conditions: SQL[] = [];

    if (searchCondition) {
      conditions.push(searchCondition);
    }

    if (currentUserRole === Role.ADMIN) {
      const adminRegionLinks = await db
        .select({ regionId: usersToRegions.regionId })
        .from(usersToRegions)
        .where(eq(usersToRegions.userId, currentUserId));
      const adminRegionIds = adminRegionLinks.map((link) => link.regionId);

      if (adminRegionIds.length === 0) {
        return { query: null, countQuery: null };
      }

      const usersInAdminRegions = await db
        .selectDistinct({ userId: usersToRegions.userId })
        .from(usersToRegions)
        .where(inArray(usersToRegions.regionId, adminRegionIds));
      const userIdsInAdminRegions = usersInAdminRegions.map((u) => u.userId);

      conditions.push(inArray(documents.userId, userIdsInAdminRegions));
    } else if (currentUserRole === Role.USER) {
      conditions.push(eq(documents.userId, currentUserId));
    }

    if (dataType && dataType !== "all") {
      conditions.push(eq(documents.formatId, dataType));
    }

    if (status && status !== "all") {
      if (Object.values(DocumentStatus).includes(status as DocumentStatus)) {
        conditions.push(eq(documents.status, status as DocumentStatus));
      }
    }

    if (step && step !== "all") {
      const level = parseInt(step, 10);
      if (!isNaN(level)) {
        conditions.push(eq(documents.level, level));
      }
    }

    if (regionId && regionId !== "all") {
      console.warn(
        "Region filtering by ID is not implemented correctly. Requires name."
      );
    }

    if (islandId && islandId !== "all") {
      console.warn(
        "Island filtering by ID is not implemented correctly. Requires name."
      );
    }

    if (dateFrom) {
      try {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        conditions.push(gte(documents.createdAt, fromDate));
      } catch (e) {
        console.error(e);
        console.error("Invalid dateFrom format:", dateFrom);
      }
    }
    if (dateTo) {
      try {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        conditions.push(lte(documents.createdAt, toDate));
      } catch (e) {
        console.error(e);
        console.error("Invalid dateTo format:", dateTo);
      }
    }

    const finalCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    if (finalCondition) {
      baseDataQuery.where(finalCondition);
      baseCountQuery.where(finalCondition);
    }

    const queryDocumentFormats = await db.query.documentFormats.findMany();
    return {
      query: baseDataQuery,
      countQuery: baseCountQuery,
      queryDocumentFormats,
    };
  };

  const {
    query: dataQueryBuilder,
    countQuery: countQueryBuilder,
    queryDocumentFormats,
  } = await buildFilteredQuery();

  if (!dataQueryBuilder || !countQueryBuilder) {
    const formats = await db.query.documentFormats.findMany();
    return children([], 0, formats ?? []);
  }

  const dataQuery = dataQueryBuilder
    .orderBy(orderByFunction(orderByColumn))
    .limit(limit)
    .offset(offset);

  const [foundDocumentsResult, countResult] = await Promise.all([
    dataQuery,
    countQueryBuilder,
  ]);

  const totalCount = countResult[0]?.count ?? 0;

  return children(
    foundDocumentsResult as DocumentWithUser[],
    totalCount,
    queryDocumentFormats
  );
};

export default DocumentWrapper;
