import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

export function ErrorMessage({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      role="alert"
      className={`flex items-start gap-2 rounded-md border border-ras-error/30 bg-ras-error/10 px-3.5 py-3 text-sm text-ras-error ${className}`}
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
