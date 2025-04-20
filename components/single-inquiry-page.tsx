import DOMPurify from "isomorphic-dompurify";
import { CircleUserRound, Download } from "lucide-react";
import Image from "next/image";
import React from "react";

import { Role, SingleInquiry } from "@/db/schemas";
import formatDate from "@/lib/utils/parse/format-date";
import renderRoleName from "@/lib/utils/parse/render-role-name";

import Comment from "./shared/comments/comment";
import DownloadButton from "./shared/download-button";
import FormCreateComment from "./shared/form-create-comment";

interface SingleInquiryPageProps {
  inquiry: SingleInquiry;
  currentRole: Role;
}

const SingleInquiryPage = ({
  inquiry,
  currentRole,
}: SingleInquiryPageProps) => {
  return (
    <div className="p-4 space-y-6 rounded-lg shadow-md py-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">{inquiry.title}</h1>
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <CircleUserRound className="w-5 h-5" />
          <span>
            {renderRoleName(
              currentRole,
              inquiry.user?.role as Role,
              inquiry.user.username
            )}
          </span>
          <span>{formatDate(inquiry.createdAt)}</span>
        </div>
      </div>

      {/* Content */}
      <main
        className="p-4 border rounded bg-gray-50 break-words [&>pre]:whitespace-pre-wrap max-w-[calc(100vw-16rem)] mx-auto overflow-x-auto"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(inquiry.content),
        }}
      />

      {/* Images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {inquiry.images.length > 0
          ? inquiry.images.map((img) => (
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
      {inquiry.files.length > 0 && (
        <div className="space-y-2">
          {inquiry.files.map((file) => (
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
                className="p-2 h-auto bg-transparent border-none hover:bg-gray-200"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </DownloadButton>
            </div>
          ))}
        </div>
      )}

      {/* Comments Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold">
          댓글 ({inquiry.comments.length})
        </h3>
        {inquiry.comments.length > 0 ? (
          inquiry.comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentRole={currentRole}
            />
          ))
        ) : (
          <Comment noComment />
        )}
      </div>

      <div className="pt-4 border-t">
        <FormCreateComment inquiryId={inquiry.id} />
      </div>
    </div>
  );
};

export default SingleInquiryPage;
