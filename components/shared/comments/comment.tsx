import { CircleUserRound } from "lucide-react";
import React from "react";

import { CommentWithAuthor, Role } from "@/db/schemas";
import formatDate from "@/lib/utils/parse/format-date";
import renderRoleName from "@/lib/utils/parse/render-role-name";

interface CommentProps {
  comment?: CommentWithAuthor;
  noComment?: boolean;
  currentRole?: Role;
}

const Comment = ({ comment, noComment, currentRole }: CommentProps) => {
  if (noComment) {
    return <p className="text-sm text-gray-500">아직 댓글이 없습니다.</p>;
  } else if (comment && currentRole) {
    return (
      <div key={comment.id} className="p-4 border rounded bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-sm font-medium space-x-2">
            <CircleUserRound className="w-5 h-5 text-gray-500" />
            <span>
              {renderRoleName(
                currentRole,
                comment.author?.role as Role,
                comment.author?.username as string
              )}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-700">{comment.content}</p>
      </div>
    );
  }
};

export default Comment;
