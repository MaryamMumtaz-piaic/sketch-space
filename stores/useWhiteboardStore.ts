"use client";

import { create } from "zustand";

import {
  DEFAULT_STROKE_DARK,
  DEFAULT_STROKE_LIGHT,
  DEFAULT_STYLE,
  MAX_ZOOM,
  MIN_ZOOM,
} from "@/lib/constants";
import { clamp } from "@/lib/utils";
import type { CanvasApi, StyleSettings, Tool } from "@/types/whiteboard";

interface WhiteboardState {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;

  canvasApi: CanvasApi | null;
  setCanvasApi: (api: CanvasApi | null) => void;

  zoom: number;
  setZoom: (zoom: number) => void;

  canUndo: boolean;
  canRedo: boolean;
  setHistoryState: (state: { canUndo: boolean; canRedo: boolean }) => void;

  hasSelection: boolean;
  setHasSelection: (hasSelection: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;

  style: StyleSettings;
  setStyle: (patch: Partial<StyleSettings>) => void;
  setStroke: (stroke: string) => void;
  setFill: (fill: string | null) => void;
  hydrateStyle: (patch: Partial<StyleSettings>) => void;
  applyThemeStroke: (theme: "light" | "dark") => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  activeTool: "select",
  setActiveTool: (activeTool) => set({ activeTool }),

  canvasApi: null,
  setCanvasApi: (canvasApi) => set({ canvasApi }),

  zoom: 1,
  setZoom: (zoom) => set({ zoom: clamp(zoom, MIN_ZOOM, MAX_ZOOM) }),

  canUndo: false,
  canRedo: false,
  setHistoryState: ({ canUndo, canRedo }) => set({ canUndo, canRedo }),

  hasSelection: false,
  setHasSelection: (hasSelection) => set({ hasSelection }),

  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  helpOpen: false,
  setHelpOpen: (helpOpen) =>
    set((state) => ({
      helpOpen,
      sidebarOpen: helpOpen ? false : state.sidebarOpen,
    })),

  style: { ...DEFAULT_STYLE },
  setStyle: (patch) =>
    set((state) => ({ style: { ...state.style, ...patch } })),
  setStroke: (stroke) =>
    set((state) => ({
      style: { ...state.style, stroke, strokeAuto: false },
    })),
  setFill: (fill) => set((state) => ({ style: { ...state.style, fill } })),
  // Used when the panel mirrors an existing object instead of the user.
  hydrateStyle: (patch) =>
    set((state) => ({
      style: {
        ...state.style,
        ...patch,
        ...(patch.stroke ? { strokeAuto: false } : {}),
      },
    })),
  applyThemeStroke: (theme) =>
    set((state) => {
      if (!state.style.strokeAuto) return state;
      const stroke =
        theme === "dark" ? DEFAULT_STROKE_DARK : DEFAULT_STROKE_LIGHT;
      if (state.style.stroke === stroke) return state;
      return { style: { ...state.style, stroke } };
    }),
}));
