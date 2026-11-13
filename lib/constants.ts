import type { StrokeStyle, StyleSettings, Tool } from "@/types/whiteboard";

export const APP_NAME = "SketchSpace";
export const APP_DESCRIPTION =
  "A fast, Excalidraw-style infinite whiteboard for sketching ideas, diagrams and notes.";

/** Brand accent — used for active tools, selection and primary actions. */
export const ACCENT = "#6965db";

export const CANVAS_LIGHT = "#ffffff";
export const CANVAS_DARK = "#121212";

export const DEFAULT_STROKE_LIGHT = "#1e1e1e";
export const DEFAULT_STROKE_DARK = "#e8e8ec";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 30;
export const ZOOM_STEP = 1.2;

export const STORAGE_KEY = "sketchspace:drawing:v1";

export const STROKE_WIDTHS = [
  { label: "Thin", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Bold", value: 4 },
] as const;

/** Excalidraw classic stroke palette. */
export const STROKE_COLORS = [
  { name: "Black", value: "#1e1e1e" },
  { name: "Red", value: "#e03131" },
  { name: "Green", value: "#2f9e44" },
  { name: "Blue", value: "#1971c2" },
  { name: "Orange", value: "#f08c00" },
  { name: "Violet", value: ACCENT },
  { name: "White", value: DEFAULT_STROKE_DARK },
] as const;

/** Fill palette pairs each swatch with a soft solid tint. */
export const FILL_COLORS = [
  { name: "Red", value: "#ffc9c9" },
  { name: "Green", value: "#b2f2bb" },
  { name: "Blue", value: "#a5d8ff" },
  { name: "Orange", value: "#ffec99" },
  { name: "Violet", value: "#d0bfff" },
  { name: "Grey", value: "#e9ecef" },
] as const;

export const STROKE_STYLES: { label: string; value: StrokeStyle }[] = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
];

export const DEFAULT_STYLE: StyleSettings = {
  stroke: DEFAULT_STROKE_LIGHT,
  fill: null,
  strokeWidth: 2,
  opacity: 100,
  strokeStyle: "solid",
  eraserMode: "object",
  strokeAuto: true,
};

export const TOOL_SHORTCUTS: Record<Tool, string> = {
  select: "V",
  hand: "H",
  rectangle: "R",
  diamond: "D",
  ellipse: "O",
  line: "L",
  arrow: "A",
  pencil: "P",
  text: "T",
  eraser: "E",
};

export const DRAWING_TOOLS: Tool[] = [
  "rectangle",
  "diamond",
  "ellipse",
  "line",
  "arrow",
  "pencil",
  "text",
  "eraser",
];
