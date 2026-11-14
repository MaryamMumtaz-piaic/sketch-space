"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";

import { useDrawingTools } from "@/components/canvas/useDrawingTools";
import { useCanvasHistory } from "@/components/canvas/useCanvasHistory";
import { useFabricCanvas } from "@/components/canvas/useFabricCanvas";
import type { CanvasApi } from "@/types/whiteboard";

interface CanvasStageProps {
  onReady?: (api: CanvasApi | null) => void;
}

export function CanvasStage({ onReady }: CanvasStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  const { fabricRef, interactionRef, ready } = useFabricCanvas({
    containerRef,
    canvasRef,
    theme,
    onReady,
  });

  const canvas = ready ? fabricRef.current : null;

  useCanvasHistory(canvas);
  useDrawingTools({
    canvas,
    interactionRef,
  });

  return (
    <div ref={containerRef} className="sketch-canvas">
      <canvas ref={canvasRef} aria-label="SketchSpace drawing canvas" />
    </div>
  );
}
