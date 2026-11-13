export type Tool =
  | "select"
  | "hand"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "line"
  | "arrow"
  | "pencil"
  | "text"
  | "eraser";

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type EraserMode = "object" | "soft";

export type ThemeName = "light" | "dark";

export interface StyleSettings {
  /** Stroke colour. `strokeAuto` keeps the light/dark default in sync. */
  stroke: string;
  /** Solid fill colour, or `null` for no fill. */
  fill: string | null;
  strokeWidth: number;
  /** 0–100. */
  opacity: number;
  strokeStyle: StrokeStyle;
  eraserMode: EraserMode;
  strokeAuto: boolean;
}

/** Imperative handle exposed by the canvas to the rest of the UI. */
export interface CanvasApi {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number;
  clearCanvas: () => void;
}

export interface ProjectFile {
  type: "sketchspace";
  version: 1;
  name?: string;
  createdAt: string;
  updatedAt: string;
  /** Fabric canvas JSON, stored as-is. */
  canvas: unknown;
}
