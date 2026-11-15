"use client";

import { useEffect, useState, type RefObject } from "react";

import { useWhiteboardStore } from "@/stores/useWhiteboardStore";

interface EraserCursorProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

/**
 * A ring that follows the pointer in soft-eraser mode so the brush size is
 * visible before the first stroke. The ring scales with the current zoom.
 */
export function EraserCursor({ containerRef }: EraserCursorProps) {
  const activeTool = useWhiteboardStore((state) => state.activeTool);
  const eraserMode = useWhiteboardStore((state) => state.style.eraserMode);
  const eraserWidth = useWhiteboardStore((state) => state.style.eraserWidth);
  const zoom = useWhiteboardStore((state) => state.zoom);

  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );

  const visible = activeTool === "eraser" && eraserMode === "soft";

  useEffect(() => {
    if (!visible) {
      setPosition(null);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        setPosition(null);
        return;
      }
      const rect = container.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      setPosition(
        inside
          ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
          : null,
      );
    };

    const onLeave = () => setPosition(null);
    const onBlur = () => setPosition(null);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("blur", onBlur);
    container.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onBlur);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef, visible]);

  if (!visible || !position) return null;

  const size = Math.max(8, eraserWidth * zoom);

  return (
    <div
      aria-hidden="true"
      data-testid="eraser-cursor"
      className="pointer-events-none absolute z-[6] rounded-full border-2 border-accent/80 bg-white/35 shadow-[0_0_0_1px_rgba(255,255,255,0.65)] dark:bg-black/25 dark:shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
      style={{
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}
