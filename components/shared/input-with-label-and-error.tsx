import { ComponentProps, useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputWithLabelAndErrorProps extends ComponentProps<"input"> {
  label: string;
  name: string;
  placeholder?: string;
  error: string | undefined;
  type: string;
  defaultValue?: string;
  step?: number;
}

export default function InputWithLabelAndError({
  label,
  name,
  placeholder,
  error,
  type,
  defaultValue,
  step,
}: InputWithLabelAndErrorProps) {
  const id = useId();

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className="peer"
        placeholder={placeholder}
        type={type}
        aria-invalid={!!error}
        name={name}
        defaultValue={defaultValue}
        step={step}
      />
      {error && (
        <p
          className="peer-aria-invalid:text-destructive mt-2 text-xs"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
