"use client";

import { Trash } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import ButtonWithLoading from "@/components/shared/button-with-loading";

import { removeRegion } from "../action/remove-region";
const DeleteRegionButton = ({ regionId }: { regionId: string }) => {
  const [isPending, startTransition] = useTransition();
  return (
    <ButtonWithLoading
      isLoading={isPending}
      variant="outline"
      size="icon"
      onClick={() => {
        const confirm = window.confirm("정말 삭제하시겠습니까?");

        if (!confirm) return;
        startTransition(async () => {
          const result = await removeRegion(regionId);
          if (result.success) {
            toast.success(result.success);
          } else {
            toast.error(result?.error || "삭제에 실패했습니다.");
          }
        });
      }}
      icon={<Trash className="w-4 h-4" />}
    ></ButtonWithLoading>
  );
};
export default DeleteRegionButton;
