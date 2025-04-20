import React from "react";

import NoticeForm from "@/components/shared/admin/notice-form";

const page = () => {
  return (
    <div>
      <h1>공지사항 작성</h1>
      <NoticeForm variant="create" onSuccessRedirectUrl="/super-admin/notice" />
    </div>
  );
};

export default page;
