"use client";

import { Trash } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";

import { deleteNotice } from "@/app/(after-auth)/actions/delete-notice";

import ButtonWithLoading from "./shared/button-with-loading";

const DeleteNoticeButton = () => {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const { noticeId } = useParams();
  const router = useRouter();
  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteNotice(Number(noticeId));
      if (response.success) {
        toast.success(response.message);
        router.replace(pathname.replace(`/${noticeId}`, ""));
      } else {
        toast.error(response.message);
      }
    });
  };

  return (
    <ButtonWithLoading
      variant="destructive"
      className="rounded-lg"
      isLoading={isPending}
      onClick={handleDelete}
      icon={<Trash className="w-4 h-4" />}
    >
      삭제
    </ButtonWithLoading>
  );
};

export default DeleteNoticeButton;
