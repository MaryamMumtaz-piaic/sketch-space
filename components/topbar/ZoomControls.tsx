"use client";

import { Minus, Plus } from "lucide-react";

import { Tooltip } from "@/components/ui/Tooltip";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/constants";
import { formatZoom } from "@/lib/utils";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";
import type { CanvasApi } from "@/types/whiteboard";

interface ZoomControlsProps {
  api: CanvasApi | null;
}

export function ZoomControls({ api }: ZoomControlsProps) {
  const zoom = useWhiteboardStore((state) => state.zoom);
  const atMin = zoom <= MIN_ZOOM + 0.0001;
  const atMax = zoom >= MAX_ZOOM - 0.0001;

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Zoom">
      <Tooltip label="Zoom out" shortcut="Ctrl -" side="bottom">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => api?.zoomOut()}
          disabled={!api || atMin}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground/75 transition-colors hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Minus size={16} strokeWidth={2} />
        </button>
      </Tooltip>

      <Tooltip label="Reset zoom to 100%" side="bottom">
        <button
          type="button"
          aria-label={`Reset zoom to 100% (currently ${formatZoom(zoom)})`}
          onClick={() => api?.resetZoom()}
          disabled={!api}
          className="h-8 min-w-[52px] rounded-lg px-1 text-center text-[11px] font-semibold tabular-nums text-foreground/80 transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-40"
        >
          {formatZoom(zoom)}
        </button>
      </Tooltip>

      <Tooltip label="Zoom in" shortcut="Ctrl +" side="bottom">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => api?.zoomIn()}
          disabled={!api || atMax}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground/75 transition-colors hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </Tooltip>
    </div>
  );
}
