"use client";

import {
  ActiveSelection,
  Ellipse,
  FabricObject,
  Group,
  Line,
  Path,
  Point,
  Polygon,
  type Canvas,
} from "fabric";

import { DEFAULT_STYLE } from "@/lib/constants";
import { resumeHistory, suspendHistory } from "@/lib/fabric/history";
import { createArrow } from "@/lib/fabric/shapes";
import { readStyleFromObject } from "@/lib/fabric/styles";
import type { StyleSettings } from "@/types/whiteboard";

/** Metadata persisted on every arrow group. */
interface ArrowMeta {
  id?: string;
  arrow?: boolean;
  bindStart?: string;
  bindEnd?: string;
  arrowStartX?: number;
  arrowStartY?: number;
  arrowEndX?: number;
  arrowEndY?: number;
}

type ArrowObject = Group & ArrowMeta;

export interface ArrowBinding {
  start: Point;
  end: Point;
  startId: string;
  endId: string;
}

interface FindOptions {
  exclude?: FabricObject | null;
  tolerance?: number;
}

const EPSILON = 0.0001;

function objectId(object: FabricObject | null | undefined): string {
  if (!object) return "";
  const id = (object as FabricObject & { id?: string }).id;
  return typeof id === "string" ? id : "";
}

function isPreview(object: FabricObject): boolean {
  return (object as FabricObject & { preview?: boolean }).preview === true;
}

export function isArrow(object: FabricObject): object is ArrowObject {
  return object instanceof Group && (object as ArrowObject).arrow === true;
}

function readMeta(object: FabricObject): ArrowMeta {
  return object as FabricObject & ArrowMeta;
}

/** The leaf shape (rect / ellipse / diamond / text) under a binding id. */
export function findShapeById(
  canvas: Canvas,
  id: string,
): FabricObject | null {
  if (!id) return null;
  for (const object of canvas.getObjects()) {
    if (isArrow(object) || objectId(object) !== id) continue;
    return object;
  }
  return null;
}

function screenTolerance(canvas: Canvas, tolerance?: number) {
  if (typeof tolerance === "number") return tolerance;
  // Binding should feel the same at every zoom level.
  return 24 / Math.max(canvas.getZoom(), 0.01);
}

function distanceToRect(
  point: Point,
  rect: { left: number; top: number; width: number; height: number },
) {
  const dx = Math.max(rect.left - point.x, 0, point.x - (rect.left + rect.width));
  const dy = Math.max(rect.top - point.y, 0, point.y - (rect.top + rect.height));
  return Math.hypot(dx, dy);
}

/**
 * Find the shape closest to an arrow endpoint. Arrows, freehand paths and
 * preview objects never act as anchors.
 */
export function findBindableObject(
  canvas: Canvas,
  point: Point,
  { exclude = null, tolerance }: FindOptions = {},
): FabricObject | null {
  const limit = screenTolerance(canvas, tolerance);
  let best: { object: FabricObject; distance: number; area: number } | null =
    null;

  for (const object of canvas.getObjects()) {
    if (object === exclude) continue;
    if (!object.visible || !object.selectable || isPreview(object)) continue;
    if (isArrow(object) || object instanceof Line || object instanceof Path) {
      continue;
    }

    object.setCoords();
    const rect = object.getBoundingRect();
    if (rect.width < 1 && rect.height < 1) {
      continue;
    }

    const distance = distanceToRect(point, rect);
    if (distance > limit) continue;

    const area = Math.max(1, rect.width * rect.height);
    if (
      !best ||
      distance < best.distance - 0.01 ||
      (Math.abs(distance - best.distance) <= 0.01 && area < best.area)
    ) {
      best = { object, distance, area };
    }
  }

  return best?.object ?? null;
}

/**
 * The point where a line from the shape centre towards `toward` leaves the
 * shape. Rectangles use their box, ellipses their curve and diamonds their
 * four edges, so arrows touch the visible outline rather than a corner gap.
 */
export function edgePoint(object: FabricObject, toward: Point): Point {
  const center = object.getCenterPoint();
  const rect = object.getBoundingRect();
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;

  if (
    halfWidth < 0.5 ||
    halfHeight < 0.5 ||
    (Math.abs(dx) < EPSILON && Math.abs(dy) < EPSILON)
  ) {
    return center;
  }

  let scale: number;
  if (object instanceof Ellipse) {
    scale = 1 / Math.sqrt((dx / halfWidth) ** 2 + (dy / halfHeight) ** 2);
  } else if (object instanceof Polygon) {
    scale =
      1 /
      (Math.abs(dx) / halfWidth + Math.abs(dy) / halfHeight);
  } else {
    scale = 1 / Math.max(Math.abs(dx) / halfWidth, Math.abs(dy) / halfHeight);
  }

  return new Point(center.x + dx * scale, center.y + dy * scale);
}

/**
 * Snap a freshly drawn arrow to nearby shapes. Start and end snap to the
 * closest visible edge, and their ids are stored for later movement updates.
 */
export function resolveArrowBinding(
  canvas: Canvas,
  start: Point,
  end: Point,
  { exclude = null, tolerance }: FindOptions = {},
): ArrowBinding {
  const startTarget = findBindableObject(canvas, start, { exclude, tolerance });
  const endTarget = findBindableObject(canvas, end, { exclude, tolerance });

  let a = start;
  let b = end;
  if (startTarget) a = edgePoint(startTarget, end);
  if (endTarget) b = edgePoint(endTarget, a);

  return {
    start: a,
    end: b,
    startId: objectId(startTarget),
    endId: objectId(endTarget),
  };
}

function writeBinding(arrow: Group, binding: ArrowBinding) {
  const meta = readMeta(arrow);
  meta.arrow = true;
  meta.bindStart = binding.startId;
  meta.bindEnd = binding.endId;
  meta.arrowStartX = binding.start.x;
  meta.arrowStartY = binding.start.y;
  meta.arrowEndX = binding.end.x;
  meta.arrowEndY = binding.end.y;
}

/** Create a finished arrow, already bound to any shapes under its ends. */
export function createBoundArrow(
  canvas: Canvas,
  start: Point,
  end: Point,
  style: StyleSettings,
): Group {
  const binding = resolveArrowBinding(canvas, start, end);
  const arrow = createArrow(binding.start, binding.end, style);
  writeBinding(arrow, binding);
  return arrow;
}

function arrowStyle(arrow: Group): StyleSettings {
  return {
    ...DEFAULT_STYLE,
    ...readStyleFromObject(arrow),
    fill: null,
    eraserMode: "object",
    strokeAuto: false,
  };
}

/**
 * Rebuild a bound arrow from its stored bindings and the current shape
 * positions. The group is replaced because Fabric groups do not expose a
 * reliable way to resize their children after construction.
 */
export function refreshBoundArrow(canvas: Canvas, arrow: Group): Group | null {
  const meta = readMeta(arrow);
  const startId = meta.bindStart ?? "";
  const endId = meta.bindEnd ?? "";
  if (!startId && !endId) return null;

  const startTarget = findShapeById(canvas, startId);
  const endTarget = findShapeById(canvas, endId);
  if (!startTarget && !endTarget) return null;

  let start = new Point(meta.arrowStartX ?? 0, meta.arrowStartY ?? 0);
  let end = new Point(meta.arrowEndX ?? 0, meta.arrowEndY ?? 0);

  if (startTarget) start = edgePoint(startTarget, end);
  if (endTarget) end = edgePoint(endTarget, start);

  if (Math.hypot(end.x - start.x, end.y - start.y) < 2) return null;

  const style = arrowStyle(arrow);
  const next = createArrow(start, end, style);
  const id = objectId(arrow);
  if (id) (next as ArrowObject).id = id;
  writeBinding(next, { start, end, startId, endId });

  const objects = canvas.getObjects();
  const index = objects.indexOf(arrow);
  const active = canvas.getActiveObject();
  const wasActive = active === arrow;

  suspendHistory();
  try {
    canvas.remove(arrow);
    const safeIndex = Math.max(0, Math.min(index, canvas.getObjects().length));
    canvas.insertAt(safeIndex, next);
    next.setCoords();
    if (wasActive) canvas.setActiveObject(next);
  } finally {
    resumeHistory();
  }

  return next;
}

/**
 * Refresh every arrow attached to a shape (or to any shape inside a
 * multi-selection). Selected arrows are skipped so a rebuild cannot pull them
 * out of the active selection.
 */
export function refreshArrowsForTarget(canvas: Canvas, target: FabricObject) {
  const targets =
    target instanceof ActiveSelection ? target.getObjects() : [target];
  const ids = new Set(targets.map(objectId).filter(Boolean));
  if (ids.size === 0) return 0;

  const active = canvas.getActiveObject();
  const selected =
    active instanceof ActiveSelection
      ? active.getObjects()
      : active
        ? [active]
        : [];

  let updated = 0;
  for (const object of canvas.getObjects()) {
    if (!isArrow(object)) continue;
    const meta = readMeta(object);
    if (!ids.has(meta.bindStart ?? "") && !ids.has(meta.bindEnd ?? "")) {
      continue;
    }
    if (selected.includes(object)) continue;
    if (refreshBoundArrow(canvas, object)) updated += 1;
  }
  return updated;
}

/** Manual arrow movement or resizing detaches both ends. */
export function detachArrow(arrow: FabricObject) {
  if (!isArrow(arrow)) return;
  arrow.bindStart = "";
  arrow.bindEnd = "";
}

/** Removing a shape leaves its arrows in place, but no longer bound. */
export function detachArrowsFrom(canvas: Canvas, target: FabricObject) {
  const id = objectId(target);
  if (!id) return;

  for (const object of canvas.getObjects()) {
    if (!isArrow(object)) continue;
    if (object.bindStart === id) object.bindStart = "";
    if (object.bindEnd === id) object.bindEnd = "";
  }
}
