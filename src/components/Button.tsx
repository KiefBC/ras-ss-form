import type { ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md transition focus-visible:ring-3 focus-visible:outline-none disabled:opacity-70";

const variants = {
  primary:
    "h-12 w-full bg-ras-green font-display text-lg font-semibold tracking-wider text-white uppercase shadow-sm hover:bg-ras-green-dark focus-visible:ring-ras-green/40 focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-wait",
  outline:
    "border border-ras-green px-5 py-2.5 font-semibold text-ras-green hover:bg-ras-green-tint focus-visible:ring-ras-green/30",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  /// Disables the button and shows a spinner while an action runs.
  pending?: boolean;
};

export function Button({
  variant = "primary",
  pending,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={pending}
      {...props}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {pending && (
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
      )}
      {children}
    </button>
  );
}
