"use client";

import { useEffect } from "react";
import type { Canvas } from "fabric";

import { CanvasHistory } from "@/lib/fabric/history";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";

/** Attach the JSON snapshot history to a ready canvas. */
export function useCanvasHistory(canvas: Canvas | null) {
  useEffect(() => {
    if (!canvas) return;
    const { setHistoryState, setHasSelection } = useWhiteboardStore.getState();

    const history = new CanvasHistory(canvas, setHistoryState);
    history.start();

    return () => {
      history.dispose();
      setHistoryState({ canUndo: false, canRedo: false });
      setHasSelection(false);
    };
  }, [canvas]);
}
