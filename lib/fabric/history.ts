"use client";

import type { Canvas, TMat2D } from "fabric";
import { Textbox } from "fabric";

/** How many snapshots we keep. Older states are dropped from the front. */
export const HISTORY_LIMIT = 50;

/** Rapid changes (dragging, erasing) collapse into one snapshot. */
const PUSH_DELAY = 300;

interface SerializedScene {
  objects?: { preview?: boolean }[];
  [key: string]: unknown;
}

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * One canvas per page, so the active history is reachable from the top bar and
 * the keyboard shortcuts without threading a ref through every component.
 */
let activeHistory: CanvasHistory | null = null;

export function undoCanvas() {
  void activeHistory?.undo();
}

export function redoCanvas() {
  void activeHistory?.redo();
}

/** Ask the active history to capture the scene (used after custom erasing). */
export function requestHistorySnapshot() {
  activeHistory?.schedule();
}

/** Capture immediately — used when a gesture has clearly finished. */
export function captureHistorySnapshot() {
  activeHistory?.snapshotNow();
}

/**
 * Run an external mutation (loading a file or a share link) without recording
 * it, then capture the new state as the fresh baseline.
 */
export async function runWithoutHistory<T>(action: () => Promise<T> | T) {
  if (!activeHistory) return await action();
  return activeHistory.runWithoutHistory(action);
}

function setActiveHistory(history: CanvasHistory) {
  activeHistory = history;
}

/**
 * JSON-snapshot undo/redo. Every mutation pushes a snapshot; restoring one
 * replays the whole scene with `loadFromJSON`, which keeps the implementation
 * small at the cost of rebuilding objects.
 */
export class CanvasHistory {
  private readonly canvas: Canvas;
  private readonly onState: (state: HistoryState) => void;
  private snapshots: string[] = [];
  private index = -1;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private suspended = 0;
  private disposed = false;
  private readonly onChange = () => this.schedule();

  constructor(canvas: Canvas, onState: (state: HistoryState) => void) {
    this.canvas = canvas;
    this.onState = onState;
    setActiveHistory(this);
  }

  start() {
    this.canvas.on("object:added", this.onChange);
    this.canvas.on("object:modified", this.onChange);
    this.canvas.on("object:removed", this.onChange);
    this.canvas.on("path:created", this.onChange);
    this.snapshotNow();
  }

  dispose() {
    this.disposed = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.canvas.off("object:added", this.onChange);
    this.canvas.off("object:modified", this.onChange);
    this.canvas.off("object:removed", this.onChange);
    this.canvas.off("path:created", this.onChange);
    this.snapshots = [];
    this.index = -1;
    if (activeHistory === this) activeHistory = null;
  }

  /** Debounced snapshot, so a drag or an erase gesture lands as one step. */
  schedule() {
    if (this.suspended > 0 || this.disposed) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.snapshotNow(), PUSH_DELAY);
  }

  suspend() {
    this.suspended += 1;
  }

  resume() {
    this.suspended = Math.max(0, this.suspended - 1);
  }

  /** Load a file/share scene and start a clean history from it. */
  async runWithoutHistory<T>(action: () => Promise<T> | T) {
    this.suspend();
    try {
      return await action();
    } finally {
      this.suspended = Math.max(0, this.suspended - 1);
      this.reset();
    }
  }

  /** Drop every snapshot and re-baseline on the current scene. */
  reset() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.snapshots = [];
    this.index = -1;
    this.snapshotNow();
    this.emit();
  }

  /** Capture the current scene immediately. */
  snapshotNow() {
    if (this.suspended > 0 || this.disposed) return;
    // Never snapshot half-typed text; the exit event captures the final text.
    if (
      this.canvas
        .getObjects()
        .some((object) => object instanceof Textbox && object.isEditing)
    ) {
      this.schedule();
      return;
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const next = this.serialize();
    if (next === this.snapshots[this.index]) return;

    // Drawing after an undo drops the redo branch.
    this.snapshots.splice(this.index + 1);
    this.snapshots.push(next);
    if (this.snapshots.length > HISTORY_LIMIT) this.snapshots.shift();
    this.index = this.snapshots.length - 1;
    this.emit();
  }

  async undo() {
    if (!this.canUndo) return;
    this.index -= 1;
    await this.restore(this.snapshots[this.index]);
    this.emit();
  }

  async redo() {
    if (!this.canRedo) return;
    this.index += 1;
    await this.restore(this.snapshots[this.index]);
    this.emit();
  }

  get canUndo() {
    return this.index > 0;
  }

  get canRedo() {
    return this.index >= 0 && this.index < this.snapshots.length - 1;
  }

  private serialize() {
    const scene = this.canvas.toJSON() as unknown as SerializedScene;
    // Half-drawn previews must never enter the history.
    if (scene.objects) {
      scene.objects = scene.objects.filter((object) => !object.preview);
    }
    return JSON.stringify(scene);
  }

  private async restore(snapshot: string) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const background = this.canvas.backgroundColor;
    const viewport = this.canvas.viewportTransform
      ? ([...this.canvas.viewportTransform] as TMat2D)
      : null;

    this.suspended += 1;
    try {
      await this.canvas.loadFromJSON(
        JSON.parse(snapshot) as Record<string, unknown>,
      );
      // Undo must not undo the current theme or the user's viewport.
      this.canvas.backgroundColor = background;
      if (viewport) this.canvas.setViewportTransform(viewport);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    } finally {
      this.suspended -= 1;
    }
  }

  private emit() {
    this.onState({ canUndo: this.canUndo, canRedo: this.canRedo });
  }
}
