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
import {
  clearShareHash,
  decodeSharePayload,
  readSharePayload,
} from "@/lib/share";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";
import type { ProjectFile, ThemeName } from "@/types/whiteboard";

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
 * Loads a validated share link or the autosaved scene once on startup, then
 * keeps a debounced copy in `localStorage` after every change.
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

    const applyProject = async (project: ProjectFile) => {
      await runWithoutHistory(async () => {
        await canvas.loadFromJSON(
          project.canvas as Record<string, unknown>,
        );
        // The project format deliberately excludes the theme background.
        canvas.backgroundColor =
          themeRef.current === "dark" ? CANVAS_DARK : CANVAS_LIGHT;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      });
      useWhiteboardStore.getState().setActiveTool("select");
    };

    const restore = async () => {
      // Loading order: share link → autosave → empty canvas. A valid share
      // payload wins, and the hash is removed so a refresh behaves normally.
      const payload = readSharePayload();
      let shareError: string | null = null;

      if (payload) {
        clearShareHash();
        try {
          await applyProject(decodeSharePayload(payload));
          if (cancelled) return;
          notifyRef.current?.("Shared drawing opened.");
          return;
        } catch (error) {
          if (cancelled) return;
          shareError =
            error instanceof Error
              ? error.message
              : "This share link could not be opened.";
        }
      }

      const project = readAutosave();
      if (!project) {
        if (shareError) {
          // A payload can validate but still fail while Fabric builds the
          // scene. Never leave the user with half of a broken share link.
          await runWithoutHistory(async () => {
            const objects = canvas.getObjects();
            if (objects.length > 0) canvas.remove(...objects);
            canvas.discardActiveObject();
            canvas.requestRenderAll();
          });
          notifyRef.current?.(shareError);
        }
        return;
      }

      await applyProject(project);
      if (cancelled) return;

      const objects = (project.canvas as { objects: unknown[] }).objects;
      if (objects.length > 0) {
        notifyRef.current?.(
          shareError
            ? `${shareError} Your last drawing was restored instead.`
            : "Restored your last drawing.",
        );
      } else if (shareError) {
        notifyRef.current?.(shareError);
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
