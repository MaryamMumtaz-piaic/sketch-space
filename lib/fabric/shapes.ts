import {
  Ellipse,
  FabricObject,
  Group,
  Line,
  Polygon,
  Rect,
  Textbox,
  Triangle,
  type FabricObjectProps,
  type Point,
} from "fabric";
import { nanoid } from "nanoid";

import { ACCENT } from "@/lib/constants";
import type { StyleSettings } from "@/types/whiteboard";

/** Persist the nanoid we attach to every object. */
FabricObject.customProperties = ["id"];

/** Excalidraw-style violet selection instead of Fabric's default blue. */
FabricObject.ownDefaults.borderColor = ACCENT;
FabricObject.ownDefaults.cornerColor = "#ffffff";
FabricObject.ownDefaults.cornerStrokeColor = ACCENT;
FabricObject.ownDefaults.cornerStyle = "circle";
FabricObject.ownDefaults.transparentCorners = false;
FabricObject.ownDefaults.borderScaleFactor = 1.5;

export type ShapeKind = "rectangle" | "ellipse" | "diamond";

export interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function boundsBetween(a: Point, b: Point): Bounds {
  return {
    left: Math.min(a.x, b.x),
    top: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

export function dashArrayFor(
  style: StyleSettings["strokeStyle"],
  strokeWidth: number,
): number[] | undefined {
  if (style === "dashed") {
    return [Math.max(6, strokeWidth * 3), Math.max(4, strokeWidth * 2)];
  }
  if (style === "dotted") {
    return [Math.max(0.1, strokeWidth * 0.15), Math.max(4, strokeWidth * 2.2)];
  }
  return undefined;
}

/** Shared stroke/opacity handling for every drawable object. */
export function baseStyle(style: StyleSettings): Partial<FabricObjectProps> {
  return {
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    strokeDashArray: dashArrayFor(style.strokeStyle, style.strokeWidth),
    strokeUniform: true,
    strokeLineCap: "round",
    strokeLineJoin: "round",
    opacity: style.opacity / 100,
  };
}

function withId<T extends FabricObject>(object: T): T {
  (object as T & { id: string }).id = nanoid();
  return object;
}

export function createRectangle(
  a: Point,
  b: Point,
  style: StyleSettings,
): Rect {
  const { left, top, width, height } = boundsBetween(a, b);
  return withId(
    new Rect({
      ...baseStyle(style),
      left,
      top,
      width,
      height,
      fill: style.fill ?? "",
    }),
  );
}

export function createEllipse(
  a: Point,
  b: Point,
  style: StyleSettings,
): Ellipse {
  const { left, top, width, height } = boundsBetween(a, b);
  return withId(
    new Ellipse({
      ...baseStyle(style),
      left,
      top,
      rx: width / 2,
      ry: height / 2,
      fill: style.fill ?? "",
    }),
  );
}

export function createDiamond(
  a: Point,
  b: Point,
  style: StyleSettings,
): Polygon {
  const { left, top, width, height } = boundsBetween(a, b);
  return withId(
    new Polygon(
      [
        { x: left + width / 2, y: top },
        { x: left + width, y: top + height / 2 },
        { x: left + width / 2, y: top + height },
        { x: left, y: top + height / 2 },
      ],
      {
        ...baseStyle(style),
        fill: style.fill ?? "",
      },
    ),
  );
}

export function createLine(a: Point, b: Point, style: StyleSettings): Line {
  return withId(
    new Line([a.x, a.y, b.x, b.y], {
      ...baseStyle(style),
      fill: style.stroke,
    }),
  );
}

export function shapeFactory(
  kind: ShapeKind,
  a: Point,
  b: Point,
  style: StyleSettings,
): Rect | Ellipse | Polygon {
  if (kind === "rectangle") return createRectangle(a, b, style);
  if (kind === "ellipse") return createEllipse(a, b, style);
  return createDiamond(a, b, style);
}

export function resizeShape(
  object: Rect | Ellipse,
  a: Point,
  b: Point,
): void {
  const { left, top, width, height } = boundsBetween(a, b);
  if (object instanceof Ellipse) {
    object.set({ left, top, rx: width / 2, ry: height / 2 });
  } else {
    object.set({ left, top, width, height });
  }
  object.setCoords();
}

interface ArrowGeometry {
  angle: number;
  triangleLeft: number;
  triangleTop: number;
  triangleWidth: number;
  triangleHeight: number;
  baseX: number;
  baseY: number;
}

/** Arrowhead math shared by the live preview and the final grouped arrow. */
export function arrowGeometry(
  a: Point,
  b: Point,
  strokeWidth: number,
): ArrowGeometry {
  const theta = Math.atan2(b.y - a.y, b.x - a.x);
  const height = Math.max(14, 12 + strokeWidth * 4);
  const width = height * 0.88;
  const baseX = b.x - Math.cos(theta) * height;
  const baseY = b.y - Math.sin(theta) * height;

  return {
    angle: (theta * 180) / Math.PI + 90,
    triangleLeft: (b.x + baseX) / 2,
    triangleTop: (b.y + baseY) / 2,
    triangleWidth: width,
    triangleHeight: height,
    baseX,
    baseY,
  };
}

export function createArrowhead(
  a: Point,
  b: Point,
  style: StyleSettings,
): Triangle {
  const geometry = arrowGeometry(a, b, style.strokeWidth);
  return new Triangle({
    left: geometry.triangleLeft,
    top: geometry.triangleTop,
    width: geometry.triangleWidth,
    height: geometry.triangleHeight,
    originX: "center",
    originY: "center",
    angle: geometry.angle,
    fill: style.stroke,
    stroke: style.stroke,
    strokeWidth: 0,
    opacity: style.opacity / 100,
  });
}

/** Update the two preview parts without rebuilding the objects. */
export function updateArrowParts(
  shaft: Line,
  head: Triangle,
  a: Point,
  b: Point,
  style: StyleSettings,
): void {
  const geometry = arrowGeometry(a, b, style.strokeWidth);
  shaft.set({ x1: a.x, y1: a.y, x2: geometry.baseX, y2: geometry.baseY });
  head.set({
    left: geometry.triangleLeft,
    top: geometry.triangleTop,
    angle: geometry.angle,
    width: geometry.triangleWidth,
    height: geometry.triangleHeight,
    fill: style.stroke,
    stroke: style.stroke,
  });
  shaft.setCoords();
  head.setCoords();
}

/** Final arrow is a group so it moves, resizes and deletes as one object. */
export function createArrow(a: Point, b: Point, style: StyleSettings): Group {
  const geometry = arrowGeometry(a, b, style.strokeWidth);
  const shaft = new Line([a.x, a.y, geometry.baseX, geometry.baseY], {
    ...baseStyle(style),
    fill: style.stroke,
  });
  const head = new Triangle({
    left: geometry.triangleLeft,
    top: geometry.triangleTop,
    width: geometry.triangleWidth,
    height: geometry.triangleHeight,
    originX: "center",
    originY: "center",
    angle: geometry.angle,
    fill: style.stroke,
    stroke: style.stroke,
    strokeWidth: 0,
  });

  return withId(
    new Group([shaft, head], {
      ...baseStyle(style),
      subTargetCheck: false,
    }),
  );
}

export const TEXT_FONT = '"Patrick Hand", "Comic Sans MS", cursive';

export function createText(
  point: Point,
  style: StyleSettings,
): Textbox {
  return withId(
    new Textbox("", {
      left: point.x,
      top: point.y,
      width: 240,
      fontFamily: TEXT_FONT,
      fontSize: 20,
      fill: style.stroke,
      opacity: style.opacity / 100,
      splitByGrapheme: true,
      editingBorderColor: ACCENT,
      cursorColor: style.stroke,
      selectionColor: "rgba(105, 101, 219, 0.35)",
      padding: 2,
    }),
  );
}
