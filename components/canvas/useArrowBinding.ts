"use client";

import { useEffect } from "react";
import type { Canvas, FabricObject } from "fabric";

import {
  detachArrow,
  detachArrowsFrom,
  isArrow,
  refreshArrowsForTarget,
} from "@/lib/fabric/arrows";

type TargetEvent = { target?: FabricObject };

/**
 * Keeps bound arrows attached while their shapes move, resize or rotate, and
 * detaches them when the arrow itself is edited or its shape is deleted.
 */
export function useArrowBinding(canvas: Canvas | null) {
  useEffect(() => {
    if (!canvas) return;

    const refresh = (event: TargetEvent) => {
      if (!event.target) return;
      refreshArrowsForTarget(canvas, event.target);
      canvas.requestRenderAll();
    };

    const handleModified = (event: TargetEvent) => {
      if (!event.target) return;
      if (isArrow(event.target)) {
        detachArrow(event.target);
        return;
      }
      refresh(event);
    };

    const handleRemoved = (event: TargetEvent) => {
      if (!event.target || isArrow(event.target)) return;
      detachArrowsFrom(canvas, event.target);
    };

    canvas.on("object:moving", refresh);
    canvas.on("object:scaling", refresh);
    canvas.on("object:rotating", refresh);
    canvas.on("object:modified", handleModified);
    canvas.on("object:removed", handleRemoved);

    return () => {
      canvas.off("object:moving", refresh);
      canvas.off("object:scaling", refresh);
      canvas.off("object:rotating", refresh);
      canvas.off("object:modified", handleModified);
      canvas.off("object:removed", handleRemoved);
    };
  }, [canvas]);
}
