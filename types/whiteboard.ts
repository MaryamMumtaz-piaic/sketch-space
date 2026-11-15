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

export type ExportFormat = "png" | "jpeg" | "svg";
export type ExportScale = 1 | 2 | 3;

export interface ExportOptions {
  format: ExportFormat;
  /** Include the current theme's canvas colour behind the drawing. */
  background: boolean;
  /** Pixel multiplier. Ignored for SVG. */
  scale: ExportScale;
}

/** Imperative handle exposed by the canvas to the rest of the UI. */
export interface CanvasApi {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  /** Snapshot the current scene as a portable project file. */
  getProjectFile: () => ProjectFile;
  /** Replace the scene with a validated project file. */
  loadProjectFile: (project: ProjectFile) => Promise<void>;
  /** Render the drawing (no UI or selection handles) to a data URL or SVG. */
  exportImage: (options: ExportOptions) => string;
}

export interface ProjectFile {
  type: "whiteboard";
  version: 1;
  source: "sketch-space";
  savedAt: string;
  /** Fabric canvas JSON, stored as-is (no theme background). */
  canvas: unknown;
}
