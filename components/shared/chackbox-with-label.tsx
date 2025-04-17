import { useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckboxWithLabelProps extends React.ComponentProps<typeof Checkbox> {
  label: string;
  labelClassName?: string;
}

export default function CheckboxWithLabel({
  label,
  labelClassName,
  ...props
}: CheckboxWithLabelProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-2 [--primary:var(--color-primary)] [--ring:var(--color-primary)] in-[.dark]:[--primary:var(--color-primary)] in-[.dark]:[--ring:var(--color-primary)]">
      <Checkbox id={id} {...props} />
      <Label htmlFor={id} className={cn(labelClassName)}>
        {label}
      </Label>
    </div>
  );
}
