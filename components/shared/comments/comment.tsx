"use client";

import { CircleUserRound, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  updateComment,
  deleteComment,
} from "@/app/(after-auth)/actions/crud-comment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentWithAuthor, Role } from "@/db/schemas";
import formatDate from "@/lib/utils/parse/format-date";
import renderRoleName from "@/lib/utils/parse/render-role-name";

interface CommentProps {
  comment?: CommentWithAuthor;
  noComment?: boolean;
  currentRole?: Role;
}

const Comment = ({ comment, noComment, currentRole }: CommentProps) => {
  const session = useSession();
  const isAdmin = session.data?.user.role === Role.SUPERADMIN;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment?.content || "");
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async () => {
    if (!comment?.id) return;
    startTransition(async () => {
      const result = await updateComment(comment.id.toString(), editedContent);
      if (result.success) {
        toast.success(result.message);
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = async () => {
    if (!comment?.id) return;
    startTransition(async () => {
      const result = await deleteComment(comment.id.toString());
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

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
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
            {isAdmin && !isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit comment"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isPending}
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        </div>
        {isEditing && isAdmin ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="text-sm"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(comment.content); // Reset content on cancel
                }}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isPending || editedContent === comment.content}
              >
                {isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">{comment.content}</p>
        )}
      </div>
    );
  }
  // Add a fallback return for the case where noComment is false but comment or currentRole is undefined
  // This scenario should ideally be handled by ensuring comment and currentRole are always provided when noComment is false
  return null;
};

export default Comment;
