import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { eq } from "drizzle-orm";
import DOMPurify from "isomorphic-dompurify";
import { CircleUserRound, Download } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

import DownloadButton from "@/components/shared/download-button";
import FormCreateComment from "@/components/shared/form-create-comment";
import { db } from "@/db";
import { notices } from "@/db/schemas";

const formatDate = (date: Date) => {
  return format(date, "yyyy년 MM월 dd일 HH:mm", { locale: ko });
};

const page = async ({ params }: { params: Promise<{ noticeId: string }> }) => {
  const { noticeId } = await params;

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
    <div className="p-4 space-y-6 rounded-lg shadow-md py-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">{notice.title}</h1>
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          {/* <FaRegUserCircle className="w-5 h-5" /> */}
          <CircleUserRound className="w-5 h-5" />
          <span>{notice.author?.name ?? "관리자"}</span>{" "}
          {/* Use default if author name is null */}
          <span>{formatDate(notice.createdAt)}</span>
        </div>
      </div>

      {/* Content */}
      <div
        className="p-4 border rounded bg-gray-50 break-words [&>pre]:whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notice.content) }}
      />

      {/* Images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {notice.images.length > 0
          ? notice.images.map((img) => (
              <a
                key={img.key}
                className="relative aspect-square bg-gray-200 rounded flex items-center justify-center"
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={img.url}
                  alt="Notice image"
                  className="object-cover w-full h-full rounded"
                  unoptimized
                  fill
                />
              </a>
            ))
          : null}
      </div>

      {/* Files */}
      {notice.files.length > 0 && (
        <div className="space-y-2">
          {notice.files.map((file) => (
            <div
              key={file.key}
              className="flex items-center justify-between p-3 border rounded bg-gray-50"
            >
              <div className="flex items-center space-x-2 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span>{file.name}</span>
              </div>
              <DownloadButton
                url={file.url}
                filename={file.name}
                className="p-2 h-auto bg-transparent border-none hover:bg-gray-200" // Minimal styling, adjust as needed
                aria-label={`Download ${file.name}`}
              >
                <Download className="w-5 h-5 text-gray-600" />
              </DownloadButton>
            </div>
          ))}
        </div>
      )}

      {/* Comments Section */}
      <div className="space-y-4 pt-4 border-t">
        <h2 className="text-lg font-semibold">
          댓글 ({notice.comments.length})
        </h2>
        {notice.comments.length > 0 ? (
          notice.comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm font-medium space-x-2">
                  {/* <FaRegUserCircle className="w-5 h-5 text-gray-500" /> */}
                  <CircleUserRound className="w-5 h-5 text-gray-500" />
                  {/* Cast author to bypass potential inference issue */}
                  <span>
                    {(comment.author as { name: string | null } | null)?.name ??
                      "사용자"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">아직 댓글이 없습니다.</p>
        )}
      </div>

      <div className="pt-4 border-t">
        <FormCreateComment noticeId={Number(noticeId)} />
      </div>
    </div>
  );
};

export default page;
