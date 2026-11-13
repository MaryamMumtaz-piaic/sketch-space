"use client";

import { Redo2, Undo2 } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";

/**
 * Day 1 shell: buttons are present and disabled until the history stack lands
 * with the drawing tools.
 */
export function UndoRedoButtons() {
  return (
    <>
      <IconButton
        icon={Undo2}
        label="Undo (coming soon)"
        shortcut="Ctrl Z"
        disabled
        tooltipSide="bottom"
      />
      <IconButton
        icon={Redo2}
        label="Redo (coming soon)"
        shortcut="Ctrl Shift Z"
        disabled
        tooltipSide="bottom"
      />
    </>
  );
}
