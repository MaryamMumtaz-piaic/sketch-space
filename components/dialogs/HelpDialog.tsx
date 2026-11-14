"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TOOL_SHORTCUTS } from "@/lib/constants";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";

const TOOL_LABELS: { key: keyof typeof TOOL_SHORTCUTS; label: string }[] = [
  { key: "select", label: "Selection" },
  { key: "hand", label: "Hand / pan" },
  { key: "rectangle", label: "Rectangle" },
  { key: "diamond", label: "Diamond" },
  { key: "ellipse", label: "Ellipse" },
  { key: "line", label: "Line" },
  { key: "arrow", label: "Arrow" },
  { key: "pencil", label: "Draw" },
  { key: "text", label: "Text" },
  { key: "eraser", label: "Eraser" },
];

const CANVAS_SHORTCUTS = [
  { keys: "Space + drag", label: "Pan the canvas" },
  { keys: "Ctrl + scroll", label: "Zoom to the pointer" },
  { keys: "Scroll", label: "Pan up / down" },
  { keys: "Delete", label: "Remove the selected objects" },
  { keys: "Double-click", label: "Edit a text label" },
  { keys: "M", label: "Open or close the menu" },
  { keys: "Esc", label: "Close a dialog or return to selection" },
];

function Key({ children }: { children: string }) {
  return (
    <kbd className="rounded-md border border-line bg-background/70 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-foreground/75">
      {children}
    </kbd>
  );
}

export function HelpDialog() {
  const open = useWhiteboardStore((state) => state.helpOpen);
  const setOpen = useWhiteboardStore((state) => state.setHelpOpen);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Help & shortcuts"
      description="Everything you need to move around the board."
      footer={
        <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
          Got it
        </Button>
      }
    >
      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Tools
          </h3>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {TOOL_LABELS.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2 text-[11px] text-foreground/80"
              >
                <span>{label}</span>
                <Key>{TOOL_SHORTCUTS[key]}</Key>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Canvas
          </h3>
          <div className="space-y-1.5">
            {CANVAS_SHORTCUTS.map(({ keys, label }) => (
              <div
                key={keys}
                className="flex items-center justify-between gap-3 text-[11px] text-foreground/80"
              >
                <span>{label}</span>
                <Key>{keys}</Key>
              </div>
            ))}
          </div>
        </section>

        <p className="rounded-xl border border-line bg-background/50 p-3 text-[11px] leading-relaxed text-muted">
          <span className="font-semibold text-foreground">Day 2 preview:</span>{" "}
          drawing, selection and erasing are live. Styling selected shapes, undo
          / redo, saving, exports and sharing arrive over the next few days.
        </p>
      </div>
    </Dialog>
  );
}
