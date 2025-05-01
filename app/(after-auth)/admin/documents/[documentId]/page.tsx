import { format } from "date-fns";
import { eq } from "drizzle-orm";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import Comment from "@/components/shared/comments/comment";
import DownloadButton from "@/components/shared/download-button";
import FormCreateComment from "@/components/shared/form-create-comment";
import { db } from "@/db";
import {
  CommentWithAuthor,
  documents,
  DocumentType,
  Role,
  User,
} from "@/db/schemas";

import DocumentStatusControl from "./components/document-status-control";
interface PageProps {
  params: Promise<{ documentId: string }>;
}

const page = async ({ params }: PageProps) => {
  const session = await auth();
  if (!session) {
    return redirect("/login");
  }

  const { documentId } = await params;

  const document = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    columns: {
      id: true,
      name: true,
      islandName: true,
      createdAt: true,
      content: true,
      regionName: true,
      level: true,
      reportDate: true,
      contractPeriodStart: true,
      contractPeriodEnd: true,
      reportingCompany: true,
      reporter: true,
      userId: true,
      formatId: true,
      status: true,
      typeName: true,
      typeContent: true,
      activityPeriodStart: true,
      activityPeriodEnd: true,
      activityLocation: true,
      innerActivityParticipantsNumber: true,
      outerActivityParticipantsNumber: true,
      editRequestDate: true,
      editRequestReason: true,
      editCompletedDate: true,
      approvedDate: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          username: true,
        },
      },
      editRequestAuthor: {
        columns: {
          id: true,
          role: true,
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
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
    },
  });

  if (!document) {
    return notFound();
  }

  const contractPeriod =
    document.contractPeriodStart && document.contractPeriodEnd
      ? `${format(document.contractPeriodStart, "yyyy-MM-dd")} ~ ${format(
          document.contractPeriodEnd,
          "yyyy-MM-dd"
        )}`
      : "N/A";

  const activityPeriod =
    document.activityPeriodStart && document.activityPeriodEnd
      ? `${format(document.activityPeriodStart, "yyyy-MM-dd")} ~ ${format(
          document.activityPeriodEnd,
          "yyyy-MM-dd"
        )}`
      : "N/A";

  return (
    <div className="max-w-[793px] mx-auto p-2 bg-white my-6 rounded-md **:print:text-[12px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold">{document.name}</h1>
          <p className="text-sm text-gray-500">
            {document.islandName || document.user?.username || "알 수 없음"}
            {document.createdAt && (
              <span className="ml-2">
                {format(document.createdAt, "yyyy년 M월 d일 HH:mm")}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Display Grid Copied from NewDocumentForm */}
      <div className="grid grid-cols-[auto_2fr_auto_3fr_auto_1fr_auto_2fr] border-collapse border border-gray-200 text-sm">
        <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
          권역명
        </div>
        <div className="p-2 border border-gray-200 flex items-center">
          {document.regionName ?? "N/A"}
        </div>
        <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
          대상 섬
        </div>
        <div className="p-2 border border-gray-200 flex items-center">
          {document.islandName ?? "N/A"}
        </div>
        <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
          단계
        </div>
        <div className="p-2 border border-gray-200 flex items-center">
          {document.level ? `${document.level}단계` : "N/A"}
        </div>
        <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
          보고일자
        </div>
        <div className="p-2 border border-gray-200 flex items-center">
          {document.reportDate
            ? format(document.reportDate, "yyyy-MM-dd")
            : "N/A"}
        </div>

        <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
          계약기간
        </div>
        <div className="p-2 border border-gray-200 flex items-center whitespace-nowrap">
          {contractPeriod}
        </div>

        <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
          보고기관
        </div>
        <div className="p-2 border border-gray-200 col-span-3 flex items-center">
          {document.reportingCompany ?? "N/A"}
        </div>
        <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
          보고자
        </div>
        <div className="p-2 border border-gray-200 flex items-center">
          {document.reporter ?? "N/A"}
        </div>
      </div>

      {/* Activity Section (Conditionally Rendered) */}
      {document.typeName && (
        <>
          <h2 className="text-lg font-semibold text-center my-2 pb-2 border-b border-gray-300">
            사업추진현황
          </h2>
          <div className="grid grid-cols-[auto_1fr_auto_1fr] border-collapse border border-gray-200 mb-6 text-sm">
            <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
              활동 분류
            </div>
            <div className="p-2 border border-gray-200 flex items-center">
              {document.typeName ?? "N/A"}
            </div>
            <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
              활동 내용
            </div>
            <div className="p-2 border border-gray-200 flex items-center">
              {document.typeContent ?? "N/A"}
            </div>

            <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
              활동 기간
            </div>
            <div className="p-2 border border-gray-200 flex items-center">
              {activityPeriod}
            </div>
            <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
              활동 장소
            </div>
            <div className="p-2 border border-gray-200 flex items-center">
              {document.activityLocation ?? "N/A"}
            </div>

            <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
              섬지역 참여인원
            </div>
            <div className="p-2 border border-gray-200 flex items-center">
              {document.innerActivityParticipantsNumber ?? "N/A"}
            </div>
            <div className="font-semibold bg-gray-100 p-2 border border-gray-200 text-center flex items-center justify-center">
              외부 참여인원
            </div>
            <div className="p-2 border border-gray-200 flex items-center">
              {document.outerActivityParticipantsNumber ?? "N/A"}
            </div>
          </div>
        </>
      )}

      {/* Data Section (Content) */}
      {document.content ? (
        <div
          className="text-sm"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(document.content),
          }}
        />
      ) : (
        <p className="text-gray-500">내용이 없습니다.</p>
      )}

      {/* Image Section */}
      {document.images && document.images.length > 0 && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-3">이미지 자료</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {document.images.map((image) => (
              <a
                key={image.id}
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square border rounded overflow-hidden bg-gray-100 flex items-center justify-center"
              >
                {image.url ? (
                  <Image
                    src={image.url}
                    alt="Document image"
                    layout="fill"
                    objectFit="contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-gray-400 text-xs">이미지 없음</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* File Section */}
      {document.files && document.files.length > 0 && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-3">첨부 파일</h2>
          <div className="space-y-2">
            {document.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded bg-gray-50"
              >
                <div className="flex items-center space-x-2 text-sm overflow-hidden mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 flex-shrink-0"
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
                  <span className="font-medium truncate">{file.name}</span>
                </div>
                <DownloadButton
                  url={file.url}
                  filename={file.name}
                  className="p-2 h-auto bg-transparent border-none hover:bg-gray-200 flex-shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </DownloadButton>
              </div>
            ))}
          </div>
        </div>
      )}

      <DocumentStatusControl
        document={document as unknown as DocumentType}
        currentUserRole={session.user.role as Role}
        editRequestAuthor={document.editRequestAuthor as User}
      />

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold">
          댓글 ({document.comments.length})
        </h3>
        {document.comments.length > 0 ? (
          document.comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment as unknown as CommentWithAuthor}
              currentRole={session.user.role as Role}
            />
          ))
        ) : (
          <Comment noComment />
        )}
      </div>
      <div className="pt-4 border-t">
        <FormCreateComment documentId={document.id} />
      </div>
    </div>
  );
};

export default page;
