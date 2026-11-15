"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import {
  downloadDataUrl,
  downloadText,
  exportFileName,
} from "@/lib/download";
import { cn } from "@/lib/utils";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";
import type {
  ExportFormat,
  ExportScale,
} from "@/types/whiteboard";

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "svg", label: "SVG" },
];

const SCALES: ExportScale[] = [1, 2, 3];

interface ExportDialogProps {
  onNotify: (message: string) => void;
}

export function ExportDialog({ onNotify }: ExportDialogProps) {
  const open = useWhiteboardStore((state) => state.exportOpen);
  const setOpen = useWhiteboardStore((state) => state.setExportOpen);
  const canvasApi = useWhiteboardStore((state) => state.canvasApi);

  const [format, setFormat] = useState<ExportFormat>("png");
  const [background, setBackground] = useState(true);
  const [scale, setScale] = useState<ExportScale>(2);

  // Every visit starts from the documented defaults.
  useEffect(() => {
    if (!open) return;
    setFormat("png");
    setBackground(true);
    setScale(2);
  }, [open]);

  const vector = format === "svg";

  const handleExport = () => {
    if (!canvasApi) {
      onNotify("The canvas is not ready yet. Give it a moment and try again.");
      return;
    }

    try {
      const image = canvasApi.exportImage({ format, background, scale });
      const filename = exportFileName(format);

      if (format === "svg") {
        downloadText(image, filename, "image/svg+xml;charset=utf-8");
      } else {
        downloadDataUrl(image, filename);
      }

      setOpen(false);
      onNotify(`Exported ${filename}.`);
    } catch {
      onNotify("The export failed. Try again in a moment.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Export as image"
      description="Download just the drawing — no toolbars or selection handles."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport}>
            <Download size={14} strokeWidth={2} aria-hidden="true" />
            Export {FORMATS.find((item) => item.value === format)?.label}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Format
          </h3>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-background/50 p-1">
            {FORMATS.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={format === item.value}
                onClick={() => setFormat(item.value)}
                className={cn(
                  "h-8 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  format === item.value
                    ? "bg-accent text-white shadow-sm"
                    : "text-foreground/75 hover:bg-accent-soft hover:text-accent",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between gap-4 rounded-xl border border-line bg-background/50 px-3 py-2.5">
          <div>
            <p className="text-[13px] font-medium leading-5">Background</p>
            <p className="text-[10px] leading-4 text-muted">
              {background
                ? "Uses the current theme's canvas colour"
                : "Transparent — the drawing sits on nothing"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={background}
            aria-label="Include background"
            onClick={() => setBackground((value) => !value)}
            className={cn(
              "relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-solid",
              background ? "bg-accent" : "bg-line",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                background ? "translate-x-[18px]" : "translate-x-0.5",
              )}
            />
          </button>
        </section>

        <section>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              Scale
            </h3>
            {vector ? (
              <span className="text-[10px] text-muted">
                SVG stays sharp at any size
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-background/50 p-1">
            {SCALES.map((value) => (
              <button
                key={value}
                type="button"
                disabled={vector}
                aria-pressed={scale === value}
                onClick={() => setScale(value)}
                className={cn(
                  "h-8 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-40",
                  scale === value && !vector
                    ? "bg-accent text-white shadow-sm"
                    : "text-foreground/75 hover:bg-accent-soft hover:text-accent disabled:hover:bg-transparent disabled:hover:text-foreground/75",
                )}
              >
                {value}x
              </button>
            ))}
          </div>
        </section>

        <p className="rounded-xl border border-line bg-background/50 p-3 text-[11px] leading-relaxed text-muted">
          <span className="font-semibold text-foreground">
            {format.toUpperCase()}
          </span>{" "}
          exports the visible canvas.{" "}
          {vector
            ? "Vectors keep full quality when resized."
            : `${scale}x renders at ${scale * 100}% pixel density.`}
          {format === "jpeg" && !background
            ? " JPEG has no transparency, so a white background is used instead."
            : ""}
        </p>
      </div>
    </Dialog>
  );
}
