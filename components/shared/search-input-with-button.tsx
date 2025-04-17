"use client";
import { ArrowRightIcon, SearchIcon } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SearchInputWithButtonProps
  extends React.ComponentProps<typeof Input> {
  label?: string;
  disableLabel?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function SearchInputWithButton({
  label,
  disableLabel = false,
  className,
  onSearch,
  ...props
}: SearchInputWithButtonProps) {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      {!disableLabel && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          className={cn("peer ps-9 pe-9", className)}
          type="search"
          {...props}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Submit search"
          type="button"
          onClick={() => onSearch?.(props.value as string)}
        >
          <ArrowRightIcon size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
