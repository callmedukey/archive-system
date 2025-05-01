"use client";

import { CircleUserRound } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { createComment } from "@/app/(after-auth)/actions/create-comment";

import ButtonWithLoading from "./button-with-loading";
import { Textarea } from "../ui/textarea";

const FormCreateComment = ({
  noticeId,
  inquiryId,
  documentId,
}: {
  noticeId?: number;
  inquiryId?: number;
  documentId?: string;
}) => {
  const [state, action, isPending] = useActionState(createComment, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state?.errors) {
      toast.error("댓글 작성에 실패했습니다.");
    }
  }, [state?.errors]);

  return (
    <form className="flex items-start space-x-3" action={action}>
      <CircleUserRound className="w-8 h-8 text-gray-400 mt-1" />{" "}
      <div className="flex-1">
        {noticeId && <input type="hidden" name="noticeId" value={noticeId} />}
        {inquiryId && (
          <input type="hidden" name="inquiryId" value={inquiryId} />
        )}
        {documentId && (
          <input type="hidden" name="documentId" value={documentId} />
        )}
        <Textarea
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="댓글 남기기"
          aria-label="댓글 입력"
          disabled={isPending}
          defaultValue={state?.inputs?.content}
          name="content"
        />
        <div className="flex justify-end mt-2">
          <ButtonWithLoading
            className="px-4 py-2  text-white text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
            isLoading={isPending}
            disabled={isPending}
          >
            등록
          </ButtonWithLoading>
        </div>
      </div>
    </form>
  );
};

export default FormCreateComment;
