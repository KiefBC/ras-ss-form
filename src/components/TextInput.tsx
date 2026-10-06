import type { ComponentProps } from "react";

/// Shared field look. Exported so a <select> can match the inputs.
export const inputClass =
  "block h-12 w-full rounded-md border border-ras-ink/20 bg-ras-surface px-3.5 text-base text-ras-ink shadow-xs transition placeholder:text-ras-ink/40 focus:border-ras-green focus:ring-3 focus:ring-ras-green/20 focus:outline-none aria-invalid:border-ras-error";

export function TextInput({
  className = "",
  ...props
}: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} ${className}`} />;
}
