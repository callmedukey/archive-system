import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import SingleNoticePage from "@/components/single-notice-page";
import { db } from "@/db";
import { notices, Role, SingleNotice } from "@/db/schemas";

const page = async ({ params }: { params: Promise<{ noticeId: string }> }) => {
  const { noticeId } = await params;
  const session = await auth();
  if (!session) {
    return redirect("/login");
  }

  const notice = await db.query.notices.findFirst({
    where: eq(notices.id, Number(noticeId)),
    with: {
      author: {
        columns: {
          name: true,
        },
      },
      images: {
        columns: {
          url: true,
          key: true,
        },
      },
      files: {
        columns: {
          name: true,
          url: true,
          key: true,
        },
      },
      comments: {
        with: {
          author: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
    },
  });

  if (!notice) {
    return notFound();
  }

  await db
    .update(notices)
    .set({
      viewCount: notice.viewCount + 1,
    })
    .where(eq(notices.id, Number(noticeId)));

  return (
    <SingleNoticePage
      notice={notice as unknown as SingleNotice}
      currentRole={session.user.role as Role}
    />
  );
};

export default page;
