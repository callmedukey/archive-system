"use client";
import { Check } from "lucide-react";
import React, { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { readAllNotifications } from "@/app/(after-auth)/actions/read-notifications";

import ButtonWithLoading from "./button-with-loading";

interface ReadAllNotificationsButtonProps {
  hasUnreadNotifications: boolean;
}

const ReadAllNotificationsButton = ({
  hasUnreadNotifications,
}: ReadAllNotificationsButtonProps) => {
  const [state, action, isPending] = useActionState(readAllNotifications, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={action}>
      <ButtonWithLoading
        className="rounded-lg"
        size="sm"
        disabled={!hasUnreadNotifications || isPending}
        isLoading={isPending}
        icon={<Check className="mr-auto h-4 w-4" />}
      >
        모두 읽음처리
      </ButtonWithLoading>
    </form>
  );
};

export default ReadAllNotificationsButton;
