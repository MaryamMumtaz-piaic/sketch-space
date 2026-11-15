"use client";

import { useEffect, useRef } from "react";
import type { Canvas } from "fabric";

import {
  AUTOSAVE_DELAY,
  CANVAS_DARK,
  CANVAS_LIGHT,
} from "@/lib/constants";
import {
  runWithoutHistory,
  subscribeHistorySnapshots,
} from "@/lib/fabric/history";
import { toProjectFile } from "@/lib/fabric/serialize";
import {
  clearAutosave,
  readAutosave,
  saveAutosave,
} from "@/lib/persistence";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";
import type { ThemeName } from "@/types/whiteboard";

interface UsePersistenceOptions {
  canvas: Canvas | null;
  theme: ThemeName;
  onNotify?: (message: string) => void;
}

function autosaveWarning(reason: "quota" | "unavailable") {
  if (reason === "quota") {
    return "Browser storage is full, so autosave paused. Use Save Project to download a backup.";
  }
  return "Autosave is unavailable in this browser. Use Save Project to download a backup.";
}

/**
 * Loads the autosaved scene once on startup (share links take priority on
 * Day 5) and keeps a debounced copy in `localStorage` after every change.
 */
export function usePersistence({
  canvas,
  theme,
  onNotify,
}: UsePersistenceOptions) {
  const notifyRef = useRef(onNotify);
  const themeRef = useRef<ThemeName>(theme);
  const loadedRef = useRef<Canvas | null>(null);
  const warnedRef = useRef(false);

  useEffect(() => {
    notifyRef.current = onNotify;
  }, [onNotify]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Restore the last session once per canvas instance.
  useEffect(() => {
    if (!canvas || loadedRef.current === canvas) return;
    loadedRef.current = canvas;

    let cancelled = false;

    const restore = async () => {
      // Loading order: share link → autosave → empty canvas. The share decoder
      // lands on Day 5; an incoming payload must win over browser autosave.
      if (window.location.hash.startsWith("#data=")) return;

      const project = readAutosave();
      if (!project) return;

      await runWithoutHistory(async () => {
        await canvas.loadFromJSON(
          project.canvas as Record<string, unknown>,
        );
        canvas.backgroundColor =
          themeRef.current === "dark" ? CANVAS_DARK : CANVAS_LIGHT;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      });

      if (cancelled) return;

      useWhiteboardStore.getState().setActiveTool("select");
      const objects = (project.canvas as { objects: unknown[] }).objects;
      if (objects.length > 0) {
        notifyRef.current?.("Restored your last drawing.");
      }
    };

    void restore().catch(() => {
      if (cancelled) return;
      notifyRef.current?.(
        "Your last drawing could not be restored. Starting with an empty canvas.",
      );
    });

    return () => {
      cancelled = true;
    };
  }, [canvas]);

  // Save after the scene has been quiet for a moment. History snapshots cover
  // drawing, styling, erasing, undo and redo in one place.
  useEffect(() => {
    if (!canvas) return;

    let timer: number | null = null;

    const save = () => {
      timer = null;

      const hasContent = canvas
        .getObjects()
        .some((object) => !(object as { preview?: boolean }).preview);

      // An empty board has nothing worth restoring; remove the old copy so a
      // confirmed reset cannot come back after a refresh.
      if (!hasContent) {
        clearAutosave();
        warnedRef.current = false;
        return;
      }

      const result = saveAutosave(toProjectFile(canvas));
      if (result.ok) {
        warnedRef.current = false;
        return;
      }
      if (!warnedRef.current) {
        warnedRef.current = true;
        notifyRef.current?.(autosaveWarning(result.reason));
      }
    };

    const unsubscribe = subscribeHistorySnapshots(() => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(save, AUTOSAVE_DELAY);
    });

    return () => {
      unsubscribe();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [canvas]);
}
