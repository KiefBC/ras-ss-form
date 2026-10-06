import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

/// Green "← label" link-style button at the top of a page, for going back to a list.
export function BackButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-ras-green hover:underline focus-visible:ring-3 focus-visible:ring-ras-green/30 focus-visible:outline-none"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      {children}
    </button>
  );
}
