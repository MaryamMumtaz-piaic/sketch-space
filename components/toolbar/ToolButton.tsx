"use client";

import type { LucideIcon } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";
import { TOOL_SHORTCUTS } from "@/lib/constants";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";
import type { Tool } from "@/types/whiteboard";

interface ToolButtonProps {
  tool: Tool;
  icon: LucideIcon;
  label: string;
}

export function ToolButton({ tool, icon, label }: ToolButtonProps) {
  const activeTool = useWhiteboardStore((state) => state.activeTool);
  const setActiveTool = useWhiteboardStore((state) => state.setActiveTool);
  const active = activeTool === tool;

  return (
    <IconButton
      icon={icon}
      label={label}
      shortcut={TOOL_SHORTCUTS[tool]}
      active={active}
      tooltipSide="top"
      aria-pressed={active}
      onClick={() => setActiveTool(tool)}
      className="h-9 w-9 rounded-xl sm:h-10 sm:w-10"
    />
  );
}
