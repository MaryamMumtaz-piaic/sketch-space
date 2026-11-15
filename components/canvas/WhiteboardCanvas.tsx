"use client";

import dynamic from "next/dynamic";

import type { CanvasApi } from "@/types/whiteboard";

const CanvasStage = dynamic(
  () => import("@/components/canvas/CanvasStage").then((mod) => mod.CanvasStage),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-canvas" aria-hidden />,
  },
);

interface WhiteboardCanvasProps {
  onReady?: (api: CanvasApi | null) => void;
  onNotify?: (message: string) => void;
}

/**
 * Fabric touches `window` during setup, so the canvas module is always loaded
 * on the client only (SSR-safe).
 */
export function WhiteboardCanvas({ onReady, onNotify }: WhiteboardCanvasProps) {
  return (
    <div className="absolute inset-0">
      <CanvasStage onReady={onReady} onNotify={onNotify} />
    </div>
  );
}
