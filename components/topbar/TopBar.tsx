"use client";

import { Menu, Share2 } from "lucide-react";

import { UndoRedoButtons } from "@/components/topbar/UndoRedoButtons";
import { ZoomControls } from "@/components/topbar/ZoomControls";
import { Logo } from "@/components/ui/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/constants";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";
import type { CanvasApi } from "@/types/whiteboard";

interface TopBarProps {
  canvasApi: CanvasApi | null;
  onShare: () => void;
}

export function TopBar({ canvasApi, onShare }: TopBarProps) {
  const toggleSidebar = useWhiteboardStore((state) => state.toggleSidebar);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2.5 sm:p-4">
      <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-line bg-surface p-1 shadow-island backdrop-blur-md">
        <IconButton
          icon={Menu}
          label="Open menu"
          shortcut="M"
          onClick={toggleSidebar}
          tooltipSide="bottom"
        />
        <span className="mx-0.5 hidden h-6 w-px bg-line sm:block" />
        <div className="flex items-center gap-2 pr-1.5 pl-1 sm:pl-2">
          <Logo size="sm" />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            {APP_NAME}
          </span>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-line bg-surface p-1 shadow-island backdrop-blur-md">
        <UndoRedoButtons />

        <span className="mx-0.5 h-6 w-px bg-line" />

        <ZoomControls api={canvasApi} />

        <span className="mx-0.5 h-6 w-px bg-line" />

        <Button
          variant="primary"
          size="sm"
          onClick={onShare}
          className="px-2 sm:px-3"
          aria-label="Share drawing"
        >
          <Share2 size={15} strokeWidth={2} aria-hidden="true" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </div>
    </header>
  );
}
