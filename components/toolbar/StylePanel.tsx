"use client";

import { Check } from "lucide-react";

import {
  DRAWING_TOOLS,
  ERASER_WIDTHS,
  FILL_COLORS,
  STROKE_COLORS,
  STROKE_STYLES,
  STROKE_WIDTHS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";

export function StylePanel() {
  const activeTool = useWhiteboardStore((state) => state.activeTool);
  const hasSelection = useWhiteboardStore((state) => state.hasSelection);
  const style = useWhiteboardStore((state) => state.style);
  const setStroke = useWhiteboardStore((state) => state.setStroke);
  const setFill = useWhiteboardStore((state) => state.setFill);
  const setStyle = useWhiteboardStore((state) => state.setStyle);

  const visible = hasSelection || DRAWING_TOOLS.includes(activeTool);
  if (!visible) return null;

  const isEraser = activeTool === "eraser";

  return (
    <aside
      aria-label="Shape style"
      className="absolute left-3 top-1/2 z-20 hidden max-h-[calc(100dvh-170px)] w-[204px] -translate-y-1/2 flex-col overflow-y-auto rounded-2xl border border-line bg-surface p-3 shadow-island backdrop-blur-md sidebar-scroll md:flex lg:left-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-foreground">
          Style
        </h2>
        <span className="text-[10px] font-medium capitalize text-muted">
          {activeTool}
        </span>
      </div>

      {isEraser ? (
        <section>
          <p className="mb-2 text-[11px] font-medium text-muted">Eraser mode</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-background/60 p-1 ring-1 ring-line">
            {(["object", "soft"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={style.eraserMode === mode}
                onClick={() => setStyle({ eraserMode: mode })}
                className={cn(
                  "rounded-md px-2 py-1.5 text-[11px] font-medium capitalize transition-colors",
                  style.eraserMode === mode
                    ? "bg-accent text-white shadow-sm"
                    : "text-foreground/70 hover:bg-accent-soft hover:text-accent",
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {style.eraserMode === "soft" ? (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-medium text-muted">
                Brush size
              </p>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-background/60 p-1 ring-1 ring-line">
                {ERASER_WIDTHS.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    aria-label={`${size.label} eraser`}
                    aria-pressed={style.eraserWidth === size.value}
                    onClick={() => setStyle({ eraserWidth: size.value })}
                    className={cn(
                      "grid h-7 place-items-center rounded-md transition-colors",
                      style.eraserWidth === size.value
                        ? "bg-accent-soft text-accent"
                        : "text-foreground/60 hover:bg-accent-soft hover:text-accent",
                    )}
                  >
                    <span
                      className="rounded-full bg-current"
                      style={{
                        width: Math.max(5, size.value / 3.2),
                        height: Math.max(5, size.value / 3.2),
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-2 text-[10px] leading-relaxed text-muted">
            {style.eraserMode === "object"
              ? "Object mode removes whole shapes with one click or drag."
              : "Soft mode erases inside shapes without deleting them. The ring shows the brush size."}
          </p>
        </section>
      ) : (
        <>
          <section className="mb-3">
            <p className="mb-1.5 text-[11px] font-medium text-muted">
              Stroke
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STROKE_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={`Stroke ${color.name}`}
                  aria-pressed={style.stroke === color.value}
                  onClick={() => setStroke(color.value)}
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-md ring-1 ring-inset ring-black/10 transition-transform hover:scale-105",
                    style.stroke === color.value &&
                      "ring-2 ring-accent ring-offset-1 ring-offset-surface-solid",
                  )}
                  style={{ backgroundColor: color.value }}
                >
                  {style.stroke === color.value ? (
                    <Check
                      size={12}
                      strokeWidth={3}
                      className={
                        color.value === "#ffffff"
                          ? "text-black/60"
                          : "text-white"
                      }
                    />
                  ) : null}
                </button>
              ))}

              <label
                className="relative grid h-6 w-6 cursor-pointer place-items-center overflow-hidden rounded-md ring-1 ring-inset ring-black/10"
                style={{
                  background:
                    "conic-gradient(#e03131, #f08c00, #2f9e44, #1971c2, #6965db, #e03131)",
                }}
                title="Custom stroke colour"
              >
                <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-white text-[8px] font-bold text-black">
                  +
                </span>
                <input
                  type="color"
                  aria-label="Custom stroke colour"
                  value={style.stroke}
                  onChange={(event) => setStroke(event.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </section>

          <section className="mb-3">
            <p className="mb-1.5 text-[11px] font-medium text-muted">Fill</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-label="No fill"
                aria-pressed={style.fill === null}
                onClick={() => setFill(null)}
                className={cn(
                  "relative h-6 w-6 overflow-hidden rounded-md bg-background ring-1 ring-inset ring-black/10 transition-transform hover:scale-105",
                  style.fill === null &&
                    "ring-2 ring-accent ring-offset-1 ring-offset-surface-solid",
                )}
              >
                <span className="absolute left-1/2 top-1/2 h-px w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-500" />
              </button>

              {FILL_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={`Fill ${color.name}`}
                  aria-pressed={style.fill === color.value}
                  onClick={() => setFill(color.value)}
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-md ring-1 ring-inset ring-black/10 transition-transform hover:scale-105",
                    style.fill === color.value &&
                      "ring-2 ring-accent ring-offset-1 ring-offset-surface-solid",
                  )}
                  style={{ backgroundColor: color.value }}
                >
                  {style.fill === color.value ? (
                    <Check
                      size={12}
                      strokeWidth={3}
                      className="text-black/60"
                    />
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-3">
            <p className="mb-1.5 text-[11px] font-medium text-muted">
              Stroke width
            </p>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-background/60 p-1 ring-1 ring-line">
              {STROKE_WIDTHS.map((width) => (
                <button
                  key={width.value}
                  type="button"
                  aria-label={`${width.label} stroke`}
                  aria-pressed={style.strokeWidth === width.value}
                  onClick={() => setStyle({ strokeWidth: width.value })}
                  className={cn(
                    "grid h-7 place-items-center rounded-md transition-colors",
                    style.strokeWidth === width.value
                      ? "bg-accent-soft text-accent"
                      : "text-foreground/60 hover:bg-accent-soft hover:text-accent",
                  )}
                >
                  <span
                    className="w-5 rounded-full bg-current"
                    style={{ height: Math.min(width.value + 1, 4) }}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="mb-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted">Opacity</p>
              <span className="text-[10px] font-semibold tabular-nums text-foreground/70">
                {style.opacity}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={style.opacity}
              aria-label="Opacity"
              onChange={(event) =>
                setStyle({ opacity: Number(event.target.value) })
              }
              className="opacity-slider"
            />
          </section>

          <section>
            <p className="mb-1.5 text-[11px] font-medium text-muted">
              Stroke style
            </p>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-background/60 p-1 ring-1 ring-line">
              {STROKE_STYLES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={style.strokeStyle === item.value}
                  onClick={() => setStyle({ strokeStyle: item.value })}
                  className={cn(
                    "grid h-7 place-items-center rounded-md transition-colors",
                    style.strokeStyle === item.value
                      ? "bg-accent-soft text-accent"
                      : "text-foreground/60 hover:bg-accent-soft hover:text-accent",
                  )}
                >
                  <span
                    className="w-5 border-t-2 border-current"
                    style={{ borderTopStyle: item.value }}
                  />
                </button>
              ))}
            </div>
          </section>

          <p className="mt-3 border-t border-line pt-2 text-[10px] leading-relaxed text-muted">
            {hasSelection
              ? "Applies to the selection and your next shape."
              : "Applies to your next shape."}
          </p>
        </>
      )}
    </aside>
  );
}
