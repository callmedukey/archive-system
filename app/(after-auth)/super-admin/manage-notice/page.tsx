import React, { Suspense } from "react";

import AdminsNoticesTable from "@/components/shared/admin/admins-notices-table";
import NoticeWrapper from "@/components/shared/server/notice-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Role } from "@/db/schemas";

interface ManageNoticePageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    query?: string;
  }>;
}

const page = async ({ searchParams }: ManageNoticePageProps) => {
  const { page: pageParam, limit: limitParam, query } = await searchParams;

  const currentPage = Math.max(1, pageParam ? parseInt(pageParam) : 1);
  const limit = Math.max(
    1,
    Math.min(100, limitParam ? parseInt(limitParam) : 10)
  );
  const searchQuery = query ?? "";

  return (
    <div>
      <h1>공지사항</h1>
      <Suspense
        fallback={
          <>
            <div className="max-w-xs grid grid-cols-2 gap-2 mt-6 w-full">
              <Skeleton className="w-full h-10 rounded-lg" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <Skeleton className="w-full h-120 rounded-lg mt-6" />
          </>
        }
      >
        <NoticeWrapper
          role={Role.SUPERADMIN}
          page={currentPage}
          limit={limit}
          query={searchQuery}
        >
          {(fetchedNotices, totalCount) => (
            <AdminsNoticesTable
              initialNotices={fetchedNotices ?? []}
              totalCount={totalCount ?? 0}
              initialPage={currentPage}
              initialLimit={limit}
              initialQuery={searchQuery}
              role={Role.SUPERADMIN}
            />
          )}
        </NoticeWrapper>
      </Suspense>
    </div>
  );
};

export default page;
