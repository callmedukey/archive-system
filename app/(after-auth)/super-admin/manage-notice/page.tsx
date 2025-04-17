import React, { Suspense } from "react";

import AdminsNoticesTable from "@/components/shared/admin/admins-notices-table";
import NoticeWrapper from "@/components/shared/server/notice-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Role } from "@/db/schemas";

const page = async () => {
  return (
    <div>
      <h1>공지사항</h1>
      <Suspense
        fallback={
          <>
            <div className="max-w-xs grid grid-cols-3 gap-2 mt-6">
              <Skeleton className="w-full h-10 rounded-lg" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <Skeleton className="w-full h-10 rounded-lg mt-6" />
            <Skeleton className="w-full h-[60vh] rounded-lg mt-6" />
          </>
        }
      >
        <NoticeWrapper role={Role.SUPERADMIN}>
          {(fetchedNotices) => (
            <AdminsNoticesTable
              initialNotices={fetchedNotices ?? []}
              role={Role.SUPERADMIN}
            />
          )}
        </NoticeWrapper>
      </Suspense>
    </div>
  );
};

export default page;
