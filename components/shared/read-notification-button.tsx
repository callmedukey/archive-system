"use client";

import { Check } from "lucide-react";
import React, { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { readSingleNotification } from "@/app/(after-auth)/actions/read-notifications";

import ButtonWithLoading from "./button-with-loading";

interface ReadNotificationButtonProps {
  notificationId: number;
  isRead: boolean;
}

const ReadNotificationButton = ({
  notificationId,
  isRead,
}: ReadNotificationButtonProps) => {
  const [state, action, isPending] = useActionState(
    readSingleNotification,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={action}>
      <input type="hidden" name="notificationId" value={notificationId} />
      <ButtonWithLoading
        isLoading={isPending}
        variant="outline"
        size="sm"
        className="rounded-lg w-full"
        disabled={isPending}
        icon={<Check className="mr-auto h-4 w-4" />}
      >
        <span className="mr-auto ml-0">{isRead ? "안읽음" : "읽음 처리"}</span>
      </ButtonWithLoading>
    </form>
  );
};

export default ReadNotificationButton;
