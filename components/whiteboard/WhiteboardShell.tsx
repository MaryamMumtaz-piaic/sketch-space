"use client";

import { useCallback, useEffect, useState } from "react";

import { WhiteboardCanvas } from "@/components/canvas/WhiteboardCanvas";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { StylePanel } from "@/components/toolbar/StylePanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { TopBar } from "@/components/topbar/TopBar";
import { Toast } from "@/components/ui/Toast";
import { ThemeStyleSync } from "@/components/whiteboard/ThemeStyleSync";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";

export function WhiteboardShell() {
  const canvasApi = useWhiteboardStore((state) => state.canvasApi);
  const setCanvasApi = useWhiteboardStore((state) => state.setCanvasApi);
  const [toast, setToast] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);

  const share = useCallback(
    () =>
      notify(
        "Share links arrive on Day 5. Your canvas is ready for drawing now.",
      ),
    [notify],
  );

  const confirmReset = useCallback(() => {
    canvasApi?.clearCanvas();
    setResetOpen(false);
    notify("Canvas cleared.");
  }, [canvasApi, notify]);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-canvas text-foreground">
      <ThemeStyleSync />

      <WhiteboardCanvas onReady={setCanvasApi} />

      <TopBar canvasApi={canvasApi} onShare={share} />
      <Toolbar />
      <StylePanel />
      <Sidebar onNotify={notify} onReset={() => setResetOpen(true)} />

      <HelpDialog />
      <ConfirmDialog
        open={resetOpen}
        title="Reset canvas?"
        description="Every shape on the board will be removed."
        confirmLabel="Reset canvas"
        onConfirm={confirmReset}
        onClose={() => setResetOpen(false)}
      />

      <div className="pointer-events-none absolute bottom-5 right-4 z-10 hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] font-medium text-muted shadow-sm backdrop-blur-md xl:flex">
        <kbd className="rounded border border-line bg-background/60 px-1.5 py-0.5 text-[9px] font-semibold text-foreground/70">
          Space
        </kbd>
        <span>drag to pan</span>
        <span className="text-line">•</span>
        <kbd className="rounded border border-line bg-background/60 px-1.5 py-0.5 text-[9px] font-semibold text-foreground/70">
          Ctrl
        </kbd>
        <span>scroll to zoom</span>
      </div>

      <Toast message={toast} />
    </main>
  );
}
