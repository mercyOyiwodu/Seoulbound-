import { Check } from "lucide-react";
import type { TrackId } from "@/lib/types";

interface Props {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  track?: TrackId;
}

export function RoundCheck({ checked, onToggle, label }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label ?? "toggle done"}
      onClick={onToggle}
      className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200 ${
        checked
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-foreground/25 bg-card hover:border-primary"
      }`}
    >
      <Check
        className={`h-5 w-5 transition-opacity duration-200 ${checked ? "opacity-100" : "opacity-0"}`}
        strokeWidth={3}
      />
    </button>
  );
}
