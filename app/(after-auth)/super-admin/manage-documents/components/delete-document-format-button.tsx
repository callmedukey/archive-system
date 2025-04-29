"use client";

import { TrashIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import ButtonWithLoading from "@/components/shared/button-with-loading";

import { deleteDocumentFormat } from "../actions/crud-document-format";

interface DeleteDocumentFormatButtonProps {
  id: string;
}

const DeleteDocumentFormatButton = ({
  id,
}: DeleteDocumentFormatButtonProps) => {
  const [isPending, startTransition] = useTransition();

  return (
    <ButtonWithLoading
      variant="ghost"
      isLoading={isPending}
      className="w-full justify-start py-1.5 h-fit px-2"
      onClick={() =>
        startTransition(async () => {
          const result = await deleteDocumentFormat({ id });
          if (result.success) {
            toast.success("양식이 삭제되었습니다.");
          } else {
            toast.error(result.message);
          }
        })
      }
      icon={<TrashIcon className="size-4 -ml-1" />}
    >
      삭제
    </ButtonWithLoading>
  );
};

export default DeleteDocumentFormatButton;
