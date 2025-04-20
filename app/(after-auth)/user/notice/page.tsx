import { redirect } from "next/navigation";
import React, { Suspense } from "react";

import { auth } from "@/auth";
import NoticesTable from "@/components/shared/notices-table";
import NoticesWrapper from "@/components/shared/server/notices-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

interface UserNoticePageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    query?: string;
  }>;
}

const page = async ({ searchParams }: UserNoticePageProps) => {
  const { page: pageParam, limit: limitParam, query } = await searchParams;

  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

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
        <NoticesWrapper
          role={session.user.role}
          page={currentPage}
          limit={limit}
          query={searchQuery}
        >
          {(pinnedNotices, fetchedNotices, totalCount) => (
            <NoticesTable
              pinnedNotices={pinnedNotices ?? []}
              initialNotices={fetchedNotices ?? []}
              totalCount={totalCount ?? 0}
              initialPage={currentPage}
              initialLimit={limit}
              initialQuery={searchQuery}
              role={session.user.role}
            />
          )}
        </NoticesWrapper>
      </Suspense>
    </div>
  );
};

export default page;
