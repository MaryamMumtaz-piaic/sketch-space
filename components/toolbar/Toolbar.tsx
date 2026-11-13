"use client";

import {
  ArrowUpRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  MousePointer2,
  Pencil,
  Slash,
  Square,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ToolButton } from "@/components/toolbar/ToolButton";
import type { Tool } from "@/types/whiteboard";

interface ToolDefinition {
  tool: Tool;
  icon: LucideIcon;
  label: string;
}

const groups: ToolDefinition[][] = [
  [
    { tool: "hand", icon: Hand, label: "Hand — pan the canvas" },
    { tool: "select", icon: MousePointer2, label: "Selection" },
  ],
  [
    { tool: "rectangle", icon: Square, label: "Rectangle" },
    { tool: "diamond", icon: Diamond, label: "Diamond" },
    { tool: "ellipse", icon: Circle, label: "Ellipse" },
    { tool: "arrow", icon: ArrowUpRight, label: "Arrow" },
    { tool: "line", icon: Slash, label: "Line" },
  ],
  [
    { tool: "pencil", icon: Pencil, label: "Draw" },
    { tool: "text", icon: Type, label: "Text" },
    { tool: "eraser", icon: Eraser, label: "Eraser" },
  ],
];

export function Toolbar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-2 pb-3 sm:pb-4">
      <div
        role="toolbar"
        aria-label="Drawing tools"
        className="pointer-events-auto flex max-w-[calc(100vw-16px)] items-center gap-0 overflow-x-auto rounded-2xl border border-line bg-surface p-1 shadow-island backdrop-blur-md scrollbar-none sm:gap-0.5 sm:overflow-visible sm:p-1.5"
      >
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-0 sm:gap-0.5">
            {groupIndex > 0 ? (
              <span className="mx-1 hidden h-7 w-px shrink-0 bg-line sm:block" />
            ) : null}
            {group.map(({ tool, icon, label }) => (
              <ToolButton key={tool} tool={tool} icon={icon} label={label} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
