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
      className={`flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800 ${className}`}
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
