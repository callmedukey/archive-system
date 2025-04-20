import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import NoticeForm from "@/components/shared/admin/notice-form";
import renderBaseRolePathname from "@/lib/utils/parse/render-role-pathname";

const page = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  return (
    <div>
      <h1>공지사항 작성</h1>
      <NoticeForm
        variant="create"
        onSuccessRedirectUrl={`/${renderBaseRolePathname(
          session.user.role
        )}/notice`}
      />
    </div>
  );
};

export default page;
