import { LoaderCircleIcon } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

interface ButtonWithLoadingProps extends React.ComponentProps<typeof Button> {
  isLoading: boolean;
  children: React.ReactNode;
}

const ButtonWithLoading = ({
  isLoading,
  children,
  ...props
}: ButtonWithLoadingProps) => {
  return (
    <Button
      {...props}
      className={cn("flex items-center gap-2", props.className)}
    >
      {isLoading && <LoaderCircleIcon className="size-4 animate-spin" />}
      {children}
    </Button>
  );
};

export default ButtonWithLoading;
