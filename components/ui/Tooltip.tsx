import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Side = "top" | "bottom";

interface TooltipProps {
  label: string;
  shortcut?: string;
  side?: Side;
  children: ReactNode;
  className?: string;
}

/**
 * CSS-only tooltip: no portal, no layout thrash. Wraps a single interactive
 * child and reveals the label on hover or keyboard focus.
 */
export function Tooltip({
  label,
  shortcut,
  side = "bottom",
  children,
  className,
}: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 hidden -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md bg-[#1b1b1f] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 sm:flex dark:bg-[#f5f5f7] dark:text-[#1b1b1f]",
          side === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
        )}
      >
        {label}
        {shortcut ? (
          <kbd className="rounded border border-white/20 px-1 py-px font-sans text-[9px] font-semibold uppercase tracking-wide text-white/70 dark:border-black/15 dark:text-black/55">
            {shortcut}
          </kbd>
        ) : null}
      </span>
    </span>
  );
}
