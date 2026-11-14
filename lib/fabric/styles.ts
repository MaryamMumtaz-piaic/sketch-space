"use client";

import {
  FabricObject,
  Group,
  Line,
  Path,
  Textbox,
  Triangle,
} from "fabric";

import type { StrokeStyle, StyleSettings } from "@/types/whiteboard";

import { dashArrayFor } from "./shapes";

/** Shapes that can carry a solid fill. Lines, arrows and text never do. */
const FILLABLE_TYPES = new Set([
  "rect",
  "ellipse",
  "circle",
  "polygon",
  "triangle",
]);

function dashStyle(dash: number[] | null | undefined): StrokeStyle {
  if (!dash || dash.length === 0) return "solid";
  return dash[0] <= 1 ? "dotted" : "dashed";
}

function opacityPercent(opacity: number | undefined) {
  return Math.round((opacity ?? 1) * 100);
}

function applyStroke(
  object: FabricObject,
  style: StyleSettings,
  options: { fill: string | null | undefined },
) {
  object.set({
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    strokeDashArray: dashArrayFor(style.strokeStyle, style.strokeWidth),
    strokeUniform: true,
    strokeLineCap: "round",
    strokeLineJoin: "round",
    opacity: style.opacity / 100,
    ...(options.fill === undefined ? {} : { fill: options.fill ?? "" }),
  });
}

/** Update one object (and the children of a grouped arrow) in place. */
export function applyStyleToObject(
  object: FabricObject,
  style: StyleSettings,
) {
  if (object instanceof Group) {
    object.set({
      opacity: style.opacity / 100,
      stroke: style.stroke,
      strokeWidth: style.strokeWidth,
      strokeDashArray: dashArrayFor(style.strokeStyle, style.strokeWidth),
    });
    for (const child of object.getObjects()) {
      // The arrowhead mirrors the stroke colour and stays an outline-less fill.
      if (child instanceof Triangle) {
        child.set({
          fill: style.stroke,
          stroke: style.stroke,
          strokeWidth: 0,
          opacity: style.opacity / 100,
        });
      } else {
        applyStroke(child, style, { fill: style.stroke });
      }
      child.setCoords();
    }
    object.setCoords();
    return;
  }

  if (object instanceof Textbox) {
    object.set({ fill: style.stroke, opacity: style.opacity / 100 });
    object.setCoords();
    return;
  }

  if (object instanceof Line) {
    applyStroke(object, style, { fill: style.stroke });
    object.setCoords();
    return;
  }

  if (object instanceof Path) {
    applyStroke(object, style, { fill: undefined });
    object.setCoords();
    return;
  }

  if (FILLABLE_TYPES.has(object.type ?? "")) {
    applyStroke(object, style, { fill: style.fill });
    object.setCoords();
    return;
  }

  applyStroke(object, style, { fill: style.fill });
  object.setCoords();
}

export function applyStyleToSelection(
  objects: FabricObject[],
  style: StyleSettings,
) {
  for (const object of objects) applyStyleToObject(object, style);
}

/** Stable fingerprint of the style-bearing properties, used for change checks. */
export function styleSignature(object: FabricObject): string {
  if (object instanceof Group) {
    return JSON.stringify({
      opacity: object.opacity,
      stroke: object.stroke,
      strokeWidth: object.strokeWidth,
      strokeDashArray: object.strokeDashArray,
      children: object.getObjects().map(styleSignature),
    });
  }
  return JSON.stringify({
    type: object.type,
    stroke: object.stroke,
    fill: object.fill,
    strokeWidth: object.strokeWidth,
    opacity: object.opacity,
    strokeDashArray: object.strokeDashArray,
  });
}

/**
 * Mirror a selected object's style back into the panel. Groups use the line
 * child so arrows report the shaft's colour and width.
 */
export function readStyleFromObject(
  object: FabricObject,
): Partial<StyleSettings> {
  let source: FabricObject = object;
  if (object instanceof Group) {
    const line = object.getObjects().find((child) => child instanceof Line);
    if (line) source = line;
  }

  if (source instanceof Textbox) {
    return {
      stroke: typeof source.fill === "string" ? source.fill : undefined,
      opacity: opacityPercent(source.opacity),
      strokeAuto: false,
    };
  }

  const fillable = FILLABLE_TYPES.has(source.type ?? "");
  const patch: Partial<StyleSettings> = {
    opacity: opacityPercent(source.opacity),
    strokeAuto: false,
  };

  if (typeof source.stroke === "string" && source.stroke) {
    patch.stroke = source.stroke;
  }
  if (fillable) {
    patch.fill =
      typeof source.fill === "string" && source.fill ? source.fill : null;
  } else {
    patch.fill = null;
  }
  if (typeof source.strokeWidth === "number" && source.strokeWidth > 0) {
    patch.strokeWidth = source.strokeWidth;
  }
  patch.strokeStyle = dashStyle(source.strokeDashArray);

  return patch;
}
