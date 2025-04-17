import { useId } from "react";

import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { cn } from "@/lib/utils";
export default function SelectWithLabel({
  label,
  name,
  options,
  defaultValue,
  placeholder,
  error,
  onChange,
  value,
  className,
  disabled,
  disableLabel = false,
}: {
  label: string;
  name: string;
  options: { label: string; value: string | number }[];
  defaultValue?: string | number;
  placeholder?: string;
  error?: string;
  onChange?: (value: string | number) => void;
  value?: string | number;
  className?: string;
  disabled?: boolean;
  disableLabel?: boolean;
}) {
  const id = useId();

  return (
    <div className={"*:not-first:mt-2"}>
      {!disableLabel && <Label htmlFor={id}>{label}</Label>}
      <SelectNative
        id={id}
        name={name}
        {...(value !== undefined
          ? { value }
          : { defaultValue: defaultValue || placeholder })}
        {...(onChange
          ? {
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                onChange(e.target.value),
            }
          : {})}
        className={cn(className)}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectNative>
      {error && <p className="text-destructive text-xs mt-2">{error}</p>}
    </div>
  );
}
