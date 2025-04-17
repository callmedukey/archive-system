import React from "react";

import AdminsNoticesTable from "@/components/shared/admin/admins-notices-table";
import NoticeWrapper from "@/components/shared/server/notice-wrapper";
import { Role } from "@/db/schemas";

const page = async () => {
  return (
    <div>
      <h1>공지사항</h1>
      <NoticeWrapper role={Role.SUPERADMIN}>
        {(fetchedNotices) => (
          <AdminsNoticesTable
            initialNotices={fetchedNotices ?? []}
            role={Role.SUPERADMIN}
          />
        )}
      </NoticeWrapper>
    </div>
  );
};

export default page;
