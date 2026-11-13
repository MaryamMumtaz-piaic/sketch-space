import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  active?: boolean;
  tooltipSide?: "top" | "bottom";
  size?: "sm" | "md";
}

export function IconButton({
  icon: Icon,
  label,
  shortcut,
  active = false,
  tooltipSide = "bottom",
  size = "md",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <Tooltip label={label} shortcut={shortcut} side={tooltipSide}>
      <button
        type={type}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-40",
          size === "sm" ? "h-8 w-8" : "h-9 w-9",
          active
            ? "bg-accent text-white shadow-sm"
            : "text-foreground/75 hover:bg-accent-soft hover:text-accent",
          className,
        )}
        {...props}
      >
        <Icon
          size={size === "sm" ? 16 : 18}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </button>
    </Tooltip>
  );
}
