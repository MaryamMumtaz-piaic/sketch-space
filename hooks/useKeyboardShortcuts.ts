"use client";

import { useEffect } from "react";

import { TOOL_SHORTCUTS } from "@/lib/constants";
import { isTypingTarget } from "@/lib/utils";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";
import type { Tool } from "@/types/whiteboard";

const SHORTCUT_TO_TOOL = Object.entries(TOOL_SHORTCUTS).reduce<
  Record<string, Tool>
>((map, [tool, key]) => {
  map[key.toLowerCase()] = tool as Tool;
  return map;
}, {});

/** Global tool shortcuts and menu/escape handling. */
export function useKeyboardShortcuts() {
  const setActiveTool = useWhiteboardStore((state) => state.setActiveTool);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (isTypingTarget(event.target)) return;

      const state = useWhiteboardStore.getState();

      // Undo / redo work even with dialogs open, but never while typing.
      if ((event.ctrlKey || event.metaKey) && !event.altKey) {
        const command = event.key.toLowerCase();
        if (command === "z") {
          event.preventDefault();
          if (event.shiftKey) state.canvasApi?.redo();
          else state.canvasApi?.undo();
        } else if (command === "y") {
          event.preventDefault();
          state.canvasApi?.redo();
        }
        return;
      }
      if (event.altKey) return;

      if (event.key === "Escape") {
        if (state.helpOpen) {
          state.setHelpOpen(false);
        } else if (state.exportOpen) {
          state.setExportOpen(false);
        } else if (state.sidebarOpen) {
          state.setSidebarOpen(false);
        } else {
          setActiveTool("select");
        }
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "m") {
        event.preventDefault();
        state.toggleSidebar();
        return;
      }

      // Don't change tools underneath an open dialog or menu.
      if (state.helpOpen || state.exportOpen || state.sidebarOpen) return;

      if (event.key === "?") {
        event.preventDefault();
        state.setHelpOpen(true);
        return;
      }

      if (key === "1") {
        event.preventDefault();
        setActiveTool("select");
        return;
      }

      const tool = SHORTCUT_TO_TOOL[key];
      if (tool) {
        event.preventDefault();
        setActiveTool(tool);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setActiveTool]);
}
