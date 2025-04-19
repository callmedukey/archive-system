import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import SingleInquiryPage from "@/components/single-inquiry-page";
import { db } from "@/db";
import { inquiries, Role, SingleInquiry } from "@/db/schemas";

interface InquiryPageProps {
  params: Promise<{ inquiryId: string }>;
}

const page = async ({ params }: InquiryPageProps) => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const { inquiryId } = await params;

  const inquiry = await db.query.inquiries.findFirst({
    where: eq(inquiries.id, Number(inquiryId)),
    with: {
      user: {
        columns: {
          id: true,
          role: true,
          username: true,
        },
      },
      images: true,
      files: true,
      comments: {
        with: {
          author: {
            columns: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      },
    },
    orderBy: (comments, { desc }) => [desc(comments.createdAt)],
  });

  if (!inquiry) {
    return notFound();
  }

  await db
    .update(inquiries)
    .set({
      viewCount: (inquiry.viewCount ?? 0) + 1,
    })
    .where(eq(inquiries.id, Number(inquiryId)));

  return (
    <SingleInquiryPage
      inquiry={inquiry as unknown as SingleInquiry}
      currentRole={session.user.role as Role}
    />
  );
};

export default page;
