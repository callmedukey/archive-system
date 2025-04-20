import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import NoticeForm from "@/components/shared/admin/notice-form";
import { db } from "@/db";
import { notices, Role } from "@/db/schemas";

interface EditNoticePageProps {
  params: Promise<{ noticeId: string }>;
}

const page = async ({ params }: EditNoticePageProps) => {
  const { noticeId } = await params;
  const session = await auth();
  const currentRole = session?.user.role as Role;

  if (!noticeId) {
    return notFound();
  }

  const notice = await db.query.notices.findFirst({
    where: eq(notices.id, Number(noticeId)),
    with: {
      images: true,
      files: true,
    },
  });

  if (!notice) {
    return notFound();
  }

  if (currentRole !== Role.SUPERADMIN && notice.authorId !== session?.user.id) {
    return redirect("/login");
  }
  return (
    <div>
      <h1>공지사항 수정</h1>
      <NoticeForm
        variant="edit"
        onSuccessRedirectUrl="/super-admin/notice"
        initialData={notice}
      />
    </div>
  );
};

export default page;
