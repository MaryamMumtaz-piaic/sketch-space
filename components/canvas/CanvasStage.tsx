"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { EraserCursor } from "@/components/canvas/EraserCursor";
import { useArrowBinding } from "@/components/canvas/useArrowBinding";
import { useDrawingTools } from "@/components/canvas/useDrawingTools";
import { useCanvasHistory } from "@/components/canvas/useCanvasHistory";
import { useFabricCanvas } from "@/components/canvas/useFabricCanvas";
import { usePersistence } from "@/components/canvas/usePersistence";
import type { CanvasApi } from "@/types/whiteboard";

interface CanvasStageProps {
  onReady?: (api: CanvasApi | null) => void;
  onNotify?: (message: string) => void;
}

export function CanvasStage({ onReady, onNotify }: CanvasStageProps) {
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
  const [empty, setEmpty] = useState(true);

  // The hint disappears as soon as a real object or a drag preview exists.
  useEffect(() => {
    if (!canvas) return;

    const update = () => setEmpty(canvas.getObjects().length === 0);
    update();

    canvas.on("object:added", update);
    canvas.on("object:removed", update);

    return () => {
      canvas.off("object:added", update);
      canvas.off("object:removed", update);
    };
  }, [canvas]);

  useCanvasHistory(canvas);
  useDrawingTools({
    canvas,
    interactionRef,
  });
  useArrowBinding(canvas);
  usePersistence({
    canvas,
    theme,
    onNotify,
  });

  return (
    <div ref={containerRef} className="sketch-canvas">
      <canvas ref={canvasRef} aria-label="SketchSpace drawing canvas" />

      {empty ? (
        <div className="pointer-events-none absolute inset-0 z-[4] grid place-items-center px-6">
          <div className="max-w-xs text-center">
            <p className="font-hand text-3xl leading-tight text-foreground/85 sm:text-4xl">
              Pick a tool and start drawing
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Choose a shape, sketch freehand, or drop in a text label.
            </p>
            <p className="mt-4 text-[10px] font-medium uppercase tracking-widest text-muted/80">
              Space + drag to pan · Ctrl + scroll to zoom
            </p>
          </div>
        </div>
      ) : null}

      <EraserCursor containerRef={containerRef} />
    </div>
  );
}
