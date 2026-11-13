"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";

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

  useFabricCanvas({ containerRef, canvasRef, theme, onReady });

  return (
    <div ref={containerRef} className="sketch-canvas">
      <canvas ref={canvasRef} aria-label="SketchSpace drawing canvas" />
    </div>
  );
}
