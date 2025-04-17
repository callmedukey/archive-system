import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SubmitButton({
  loading,
  children,
  ...props
}: {
  loading: boolean;
  children: React.ReactNode;
} & React.ComponentProps<typeof Button>) {
  return (
    <Button {...props}>
      {loading && (
        <LoaderCircleIcon
          className="-ms-1 animate-spin"
          size={16}
          aria-hidden="true"
        />
      )}
      {children}
    </Button>
  );
}
