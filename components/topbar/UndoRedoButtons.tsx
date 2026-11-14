"use client";

import { Redo2, Undo2 } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";

export function UndoRedoButtons() {
  const undo = useWhiteboardStore((state) => state.canvasApi?.undo);
  const redo = useWhiteboardStore((state) => state.canvasApi?.redo);
  const canUndo = useWhiteboardStore((state) => state.canUndo);
  const canRedo = useWhiteboardStore((state) => state.canRedo);

  return (
    <>
      <IconButton
        icon={Undo2}
        label="Undo"
        shortcut="Ctrl Z"
        disabled={!canUndo}
        onClick={() => undo?.()}
        tooltipSide="bottom"
      />
      <IconButton
        icon={Redo2}
        label="Redo"
        shortcut="Ctrl Shift Z"
        disabled={!canRedo}
        onClick={() => redo?.()}
        tooltipSide="bottom"
      />
    </>
  );
}
