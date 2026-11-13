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
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const state = useWhiteboardStore.getState();

      if (event.key === "Escape") {
        if (state.helpOpen) {
          state.setHelpOpen(false);
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
      if (state.helpOpen || state.sidebarOpen) return;

      if (event.key === "?") {
        event.preventDefault();
        state.setHelpOpen(true);
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
