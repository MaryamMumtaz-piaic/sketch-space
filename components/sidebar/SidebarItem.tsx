"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  shortcut?: string;
  badge?: string;
  danger?: boolean;
  onClick: () => void;
}

export function SidebarItem({
  icon: Icon,
  label,
  description,
  shortcut,
  badge,
  danger = false,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
          : "text-foreground/85 hover:bg-accent-soft",
      )}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-background/60 transition-colors",
          danger
            ? "group-hover:border-red-200 dark:group-hover:border-red-500/30"
            : "group-hover:border-accent/30 group-hover:text-accent",
        )}
      >
        <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium leading-5">{label}</span>
        {description ? (
          <span className="block truncate text-[10px] leading-4 text-muted">
            {description}
          </span>
        ) : null}
      </span>

      {shortcut ? (
        <kbd className="rounded border border-line bg-background/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted">
          {shortcut}
        </kbd>
      ) : null}

      {badge ? (
        <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
